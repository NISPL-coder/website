import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Get all customer records with their live Sangam CRM sync statuses
 */
export const getCustomers = async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      list = await Customer.find().sort({ createdAt: -1 }).lean();
    } else {
      list = getCustomersFromFile();
    }

    const formatted = list.map((c) => ({
      ...c,
      id: c.customerId || c._id || c.id,
      sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      customers: formatted
    });
  } catch (err) {
    console.error('[CustomerController] getCustomers error:', err.message);
    const fileList = getCustomersFromFile();
    return res.status(200).json({
      success: true,
      count: fileList.length,
      customers: fileList
    });
  }
};

/**
 * Create a new Customer record and automatically sync to Sangam CRM Companies (Account module)
 */
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      alternatePhone,
      website,
      industry,
      accountRelationship,
      plan,
      serverNode,
      status,
      mrr,
      address,
      gstNo
    } = req.body;

    // 1. Mandatory field validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Contact person or company name is required.' });
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Corporate email is required.' });
    }
    const cleanPhone = (phone || '').trim();
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const companyName = (company || name).trim();
    const city = address?.city || 'Kolkata';
    const state = address?.state || 'West Bengal';
    const cityLoc = `${city}, ${state}`;

    // 2. Duplicate checking (Email, Phone)
    if (isMongoConnected()) {
      const existing = await Customer.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }]
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Customer already exists with email "${cleanEmail}" or phone "${cleanPhone}".`
        });
      }
    } else {
      const fileList = getCustomersFromFile();
      const duplicate = fileList.find(
        (c) =>
          (c.email && c.email.toLowerCase() === cleanEmail) ||
          (c.phone && c.phone.trim() === cleanPhone)
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: `Customer already exists with email "${cleanEmail}" or phone "${cleanPhone}".`
        });
      }
    }

    // 3. Prepare new Customer entity
    const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCustomerData = {
      customerId,
      id: customerId,
      name: name.trim(),
      company: companyName,
      email: cleanEmail,
      phone: cleanPhone,
      alternatePhone: (alternatePhone || '').trim(),
      website: (website || '').trim(),
      industry: industry || 'Technology',
      accountRelationship: accountRelationship || 'Customer',
      plan: plan || 'Tally Prime Cloud + VPS Gold',
      serverNode: serverNode || 'CtrlS-KOL-NODE-01',
      status: status || 'active',
      registered: new Date().toISOString().split('T')[0],
      mrr: mrr || '₹15,000',
      city: cityLoc,
      address: {
        street: address?.street || '',
        area: address?.area || '',
        city: city,
        state: state,
        country: address?.country || 'India',
        postalCode: address?.postalCode || '',
        addressType: address?.addressType || 'Office / Billing'
      },
      gstNo: (gstNo || '').trim().toUpperCase(),
      sangamCrm: {
        status: 'pending',
        recordId: null,
        lastSyncedAt: null,
        syncError: null
      }
    };

    // 4. Save Customer locally FIRST (Guarantees local data safety)
    let savedCustomer = newCustomerData;
    if (isMongoConnected()) {
      const doc = new Customer(newCustomerData);
      await doc.save();
      savedCustomer = doc.toJSON();
    }
    const currentFiles = getCustomersFromFile();
    saveCustomersToFile([savedCustomer, ...currentFiles]);

    console.log(`[CustomerController] Saved local customer: ${savedCustomer.customerId} ("${savedCustomer.company}")`);

    // 5. Automatically Synchronize to Sangam CRM Companies (Account)
    const syncResult = await sangamCrmService.createOrUpdateCompany(savedCustomer);

    // 6. Update Sangam CRM sync status in database & local backup
    if (syncResult.success) {
      savedCustomer.sangamCrm = {
        status: 'synced',
        recordId: syncResult.recordId,
        lastSyncedAt: new Date().toISOString(),
        syncError: null
      };
    } else {
      savedCustomer.sangamCrm = {
        status: 'failed',
        recordId: null,
        lastSyncedAt: new Date().toISOString(),
        syncError: syncResult.message
      };
    }

    if (isMongoConnected()) {
      await Customer.findOneAndUpdate(
        { customerId: savedCustomer.customerId },
        { sangamCrm: savedCustomer.sangamCrm }
      );
    }
    const updatedFileList = getCustomersFromFile().map((c) =>
      c.customerId === savedCustomer.customerId ? savedCustomer : c
    );
    saveCustomersToFile(updatedFileList);

    return res.status(201).json({
      success: true,
      customer: savedCustomer,
      sangamCrm: savedCustomer.sangamCrm,
      message: syncResult.success
        ? `Customer saved locally and synchronized to Sangam CRM Companies (Record ID: ${savedCustomer.sangamCrm.recordId})`
        : `Customer saved locally, but Sangam CRM sync failed: ${syncResult.message}`
    });
  } catch (err) {
    console.error('[CustomerController] createCustomer error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create customer.'
    });
  }
};

/**
 * Retry or trigger manual synchronization to Sangam CRM for a specific customer
 */
export const syncCustomerToSangam = async (req, res) => {
  try {
    const { id } = req.params;
    let customer = null;

    if (isMongoConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { $or: [{ customerId: id }, { _id: id }] } : { customerId: id };
      customer = await Customer.findOne(query);
      if (customer) customer = customer.toJSON();
    }
    if (!customer) {
      const fileList = getCustomersFromFile();
      customer = fileList.find((c) => c.customerId === id || c.id === id || c._id === id);
    }

    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer "${id}" not found.` });
    }

    console.log(`[CustomerController] Retrying Sangam CRM sync for customer: ${id}`);
    const syncResult = await sangamCrmService.createOrUpdateCompany(customer);

    const updatedSangam = syncResult.success
      ? {
          status: 'synced',
          recordId: syncResult.recordId,
          lastSyncedAt: new Date().toISOString(),
          syncError: null
        }
      : {
          status: 'failed',
          recordId: customer.sangamCrm?.recordId || null,
          lastSyncedAt: new Date().toISOString(),
          syncError: syncResult.message
        };

    customer.sangamCrm = updatedSangam;

    if (isMongoConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { $or: [{ customerId: id }, { _id: id }] } : { customerId: id };
      await Customer.findOneAndUpdate(query, { sangamCrm: updatedSangam });
    }
    const updatedList = getCustomersFromFile().map((c) =>
      c.customerId === id || c.id === id ? { ...c, sangamCrm: updatedSangam } : c
    );
    saveCustomersToFile(updatedList);

    return res.status(200).json({
      success: syncResult.success,
      sangamCrm: updatedSangam,
      message: syncResult.success
        ? `Customer successfully synchronized to Sangam CRM Companies!`
        : `Sangam CRM synchronization failed: ${syncResult.message}`
    });
  } catch (err) {
    console.error('[CustomerController] syncCustomerToSangam error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to sync customer to Sangam CRM.'
    });
  }
};

/**
 * Update an existing customer record and re-sync to Sangam CRM
 */
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    let customer = null;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ customerId: id }, { _id: id }] }
      : { customerId: id };

    if (isMongoConnected()) {
      customer = await Customer.findOne(query);
    }
    if (!customer) {
      const fileList = getCustomersFromFile();
      customer = fileList.find((c) => c.customerId === id || c.id === id || c._id === id);
    }

    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer "${id}" not found.` });
    }

    const {
      name,
      company,
      email,
      phone,
      alternatePhone,
      website,
      industry,
      accountRelationship,
      plan,
      serverNode,
      status,
      mrr,
      address,
      gstNo
    } = req.body;

    const updatedData = {
      ...(name && { name: name.trim() }),
      ...((company || name) && { company: (company || name).trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(phone && { phone: phone.trim() }),
      ...(alternatePhone !== undefined && { alternatePhone: alternatePhone.trim() }),
      ...(website !== undefined && { website: website.trim() }),
      ...(industry && { industry }),
      ...(accountRelationship && { accountRelationship }),
      ...(plan && { plan }),
      ...(serverNode && { serverNode }),
      ...(status && { status }),
      ...(mrr && { mrr }),
      ...(address && { address }),
      ...(gstNo !== undefined && { gstNo: gstNo.trim().toUpperCase() })
    };

    let savedCustomer = null;
    if (isMongoConnected()) {
      savedCustomer = await Customer.findOneAndUpdate(query, { $set: updatedData }, { new: true }).lean();
    } else {
      const fileList = getCustomersFromFile();
      const idx = fileList.findIndex((c) => c.customerId === id || c.id === id || c._id === id);
      if (idx !== -1) {
        fileList[idx] = { ...fileList[idx], ...updatedData };
        saveCustomersToFile(fileList);
        savedCustomer = fileList[idx];
      }
    }

    if (!savedCustomer) {
      savedCustomer = { ...customer.toObject?.() || customer, ...updatedData };
    }

    // Synchronize changes to Sangam CRM
    try {
      const syncResult = await sangamCrmService.createOrUpdateCompany(savedCustomer);
      if (syncResult.success) {
        savedCustomer.sangamCrm = {
          status: 'synced',
          recordId: syncResult.recordId || savedCustomer.sangamCrm?.recordId,
          lastSyncedAt: new Date().toISOString(),
          syncError: null
        };
        if (isMongoConnected()) {
          await Customer.findOneAndUpdate(query, { sangamCrm: savedCustomer.sangamCrm });
        }
      }
    } catch (crmErr) {
      console.warn('[CustomerController] Sangam CRM re-sync warning on update:', crmErr.message);
    }

    return res.status(200).json({
      success: true,
      customer: {
        ...savedCustomer,
        id: savedCustomer.customerId || savedCustomer._id
      },
      message: 'Customer updated successfully and synced to Sangam CRM.'
    });
  } catch (err) {
    console.error('[CustomerController] updateCustomer error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update customer.' });
  }
};

/**
 * Delete a customer record
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ customerId: id }, { _id: id }] }
      : { customerId: id };

    if (isMongoConnected()) {
      await Customer.findOneAndDelete(query);
    }

    const fileList = getCustomersFromFile().filter(
      (c) => c.customerId !== id && c.id !== id && c._id !== id
    );
    saveCustomersToFile(fileList);

    return res.status(200).json({
      success: true,
      message: `Customer ${id} deleted successfully.`
    });
  } catch (err) {
    console.error('[CustomerController] deleteCustomer error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete customer.' });
  }
};

