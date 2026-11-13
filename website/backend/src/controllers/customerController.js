import { logNotification } from '../services/notificationService.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Payment, { getPaymentsFromFile, savePaymentsToFile } from '../models/Payment.js';
import User from '../models/User.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import { nextContractCode } from '../services/contractProvisioning.js';
import { nextLedgerReference } from './paymentController.js';
import { logActivity } from '../utils/activityLogger.js';
import { redactRecords } from '../utils/columnPermissions.js';
import { deriveCustomerLifecycle, refreshCustomerLifecycle, matchesCustomer } from '../services/customerLifecycle.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to match a customer record against a contract record by identity
 */
const isCustomerMatch = (cust, ctr) => matchesCustomer(cust, ctr);

/**
 * Helper to compute dynamic customer summary cards data
 */
export const computeCustomerStats = (customerList = [], contractList = [], paymentList = []) => {
  const totalAccounts = customerList.length;

  let contracts = contractList;
  if (!Array.isArray(contracts) || contracts.length === 0) {
    try {
      contracts = getContractsFromFile();
    } catch {
      contracts = [];
    }
  }

  let activeClients = 0;
  let demoTrials = 0;
  let inProgressClients = 0;
  let inactivePaused = 0;

  customerList.forEach((c) => {
    const bucket = deriveCustomerLifecycle(c, contracts, paymentList);
    if (bucket === 'Active') activeClients++;
    else if (bucket === 'Demo') demoTrials++;
    else if (bucket === 'InProgress') inProgressClients++;
    else inactivePaused++;
  });

  const monthlyMrr = customerList
    .filter((c) => deriveCustomerLifecycle(c, contracts, paymentList) === 'Active')
    .reduce((sum, c) => {
      const val = parseInt(String(c.mrr || '').replace(/[^0-9]/g, ''), 10) || 0;
      return sum + val;
    }, 0);

  return {
    totalAccounts,
    activeClients,
    demoTrials,
    inProgressClients,
    inactivePaused,
    monthlyMrr,
    formattedMonthlyMrr: `₹${monthlyMrr.toLocaleString('en-IN')}`,
    descriptions: {
      totalAccounts: 'All customer records',
      activeClients: `Monthly MRR: ₹${monthlyMrr.toLocaleString('en-IN')}`,
      demoTrials: 'Trials running, nothing purchased yet',
      inProgressClients: 'Demo ended or purchase unpaid',
      inactivePaused: 'Registered without demo or purchase'
    }
  };
};

/**
 * How many orders an account has placed. The contract register is the order
 * book — one agreement per sold subscription — so the count is read from it on
 * every listing instead of stored, and a closed or deleted deal cannot leave a
 * stale number behind. Matching is on the company name, falling back to the
 * email when the deal was raised without one.
 */
const attachOrderCounts = async (list) => {
  if (!Array.isArray(list) || list.length === 0) return { list: list || [], orders: [] };

  let orders = [];
  try {
    if (isMongoConnected()) {
      orders = await Contract.find().lean();
    } else {
      orders = getContractsFromFile();
    }
  } catch (err) {
    console.warn('[CustomerController] Order count lookup failed:', err.message);
    return { list, orders: [] };
  }

  const byCompany = new Map();
  const byEmail = new Map();
  orders.forEach((order) => {
    const company = String(order.company || '').trim().toLowerCase();
    const email = String(order.email || '').trim().toLowerCase();
    if (company) byCompany.set(company, (byCompany.get(company) || 0) + 1);
    if (email) byEmail.set(email, (byEmail.get(email) || 0) + 1);
  });

  const updated = list.map((customer) => {
    const company = String(customer.company || '').trim().toLowerCase();
    const email = String(customer.email || '').trim().toLowerCase();
    const count = byCompany.get(company) ?? byEmail.get(email) ?? 0;
    const hasDemoOrder = orders.some(
      (ctr) =>
        Boolean(
          ctr.isDemoTrial ||
          ctr.trialUsed ||
          ctr.contractType === 'Trial' ||
          ctr.productCategory === 'Trial' ||
          String(ctr.status).toUpperCase() === 'DEMO' ||
          String(ctr.status).toUpperCase() === 'CONVERTED' ||
          /demo|trial/i.test(ctr.name || ctr.service || '')
        ) && isCustomerMatch(customer, ctr)
    );
    const demoTrialUsed = Boolean(
      customer.demoTrialUsed ||
      hasDemoOrder
    );
    return { ...customer, orderCount: count, demoTrialUsed };
  });

  return { list: updated, orders };
};

/**
 * Get all customer records with their live Sangam CRM sync statuses and summary stats
 */
export const getCustomers = async (req, res) => {
  try {
    let list = [];
    let customerUsers = [];
    if (isMongoConnected()) {
      list = await Customer.find().sort({ createdAt: -1 }).lean();

      // Ensure self-registered customer accounts from 'users' collection are synced into 'customers'
      try {
        customerUsers = await User.find({ role: 'customer' })
          .select('+password portalPassword lastLoginAt email customerId name phone')
          .lean();
        for (const u of customerUsers) {
          const uEmail = (u.email || '').toLowerCase();
          const uPhone = String(u.phone || '').trim();
          const alreadyExists = list.some(
            (c) => (c.email && c.email.toLowerCase() === uEmail) || (c.customerId && u.customerId && c.customerId === u.customerId)
          );
          // A contact number is the one field this row cannot be created
          // without, so an account that never gave one stays out of the
          // directory instead of arriving with an invented number.
          if (!alreadyExists && uEmail && uPhone) {
            const customerId = u.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
            const backfillDoc = new Customer({
              customerId,
              id: customerId,
              name: u.name || 'Customer Account',
              company: u.name || 'Personal Account',
              email: uEmail,
              loginEmail: uEmail,
              portalPassword: u.portalPassword || '',
              phone: uPhone,
              // Login availability is not the commercial lifecycle; a backfilled
              // account has taken nothing yet and starts Inactive.
              status: 'Inactive',
              registered: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
            });
            await backfillDoc.save();
            list.unshift(backfillDoc.toJSON());
          }
        }
      } catch (backfillErr) {
        console.warn('[CustomerController] User backfill note:', backfillErr.message);
      }
    } else {
      list = getCustomersFromFile();
    }

    const formatted = list.map((c) => {
      const matchedUser = customerUsers.find(
        (u) =>
          (u.customerId && c.customerId && String(u.customerId).toUpperCase() === String(c.customerId).toUpperCase()) ||
          (u.email && c.email && String(u.email).toLowerCase() === String(c.email).toLowerCase())
      );

      let password = c.portalPassword || matchedUser?.portalPassword;
      if (!password) {
        password = generateCustomerPassword(c.company || c.name || 'Client');
        c.portalPassword = password;
        if (isMongoConnected() && c._id) {
          Customer.findByIdAndUpdate(c._id, { portalPassword: password }).catch(() => {});
          if (matchedUser) {
            User.findById(matchedUser._id).then((u) => {
              if (u && !u.portalPassword) {
                u.password = password;
                u.portalPassword = password;
                return u.save();
              }
            }).catch(() => {});
          }
        }
      }

      const loginEmail = c.loginEmail || matchedUser?.email || c.email;
      const lastLoginAt = matchedUser?.lastLoginAt || c.lastLoginAt || null;

      return {
        ...c,
        id: c.customerId || c._id || c.id,
        loginEmail,
        password,
        portalPassword: password,
        lastLoginAt,
        sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
      };
    });

    const { list: counted, orders } = await attachOrderCounts(formatted);
    const ledger = isMongoConnected() ? await Payment.find().lean() : getPaymentsFromFile();
    // Report the lifecycle the registers prove, so a stale stored status word
    // cannot show an unpaid trial as an active account.
    const lifecycle = counted.map((c) => ({ ...c, status: deriveCustomerLifecycle(c, orders, ledger) }));
    const stats = computeCustomerStats(lifecycle, orders, ledger);
    const visible = redactRecords(req.user, 'customer', lifecycle);

    return res.status(200).json({
      success: true,
      count: visible.length,
      stats,
      summary: stats,
      customers: visible
    });
  } catch (err) {
    console.error('[CustomerController] getCustomers error:', err.message);
    const fileList = getCustomersFromFile();
    const { list: formattedFile, orders: fileOrders } = await attachOrderCounts(fileList.map((c) => ({
      ...c,
      id: c.customerId || c._id || c.id,
      sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
    })));
    const fileLedger = getPaymentsFromFile();
    const lifecycleFile = formattedFile.map((c) => ({ ...c, status: deriveCustomerLifecycle(c, fileOrders, fileLedger) }));
    const stats = computeCustomerStats(lifecycleFile, fileOrders, fileLedger);
    const visibleFile = redactRecords(req.user, 'customer', lifecycleFile);
    return res.status(200).json({
      success: true,
      count: visibleFile.length,
      stats,
      summary: stats,
      customers: visibleFile
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
      firstName,
      lastName,
      designation,
      company,
      email,
      phone,
      additionalEmails,
      additionalPhones,
      alternatePhone,
      website,
      industry,
      accountRelationship,
      plan,
      serverNode,
      mrr,
      address,
      gstNo,
      tallySerialNo
    } = req.body;

    const fullName = String(name || '').trim() ||
      [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean).join(' ');

    // 1. Mandatory field validation
    if (!fullName) {
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

    const companyName = (company || fullName).trim();
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
    const rawPassword = req.body.password || generateCustomerPassword(companyName);
    const newCustomerData = {
      customerId,
      id: customerId,
      name: fullName,
      firstName: String(firstName || '').trim(),
      lastName: String(lastName || '').trim(),
      designation: String(designation || '').trim(),
      company: companyName,
      email: cleanEmail,
      loginEmail: cleanEmail,
      portalPassword: rawPassword,
      phone: cleanPhone,
      additionalEmails: Array.isArray(additionalEmails) ? additionalEmails.filter(Boolean).map(e => String(e).trim().toLowerCase()) : [],
      additionalPhones: Array.isArray(additionalPhones) ? additionalPhones.filter(Boolean).map(p => String(p).trim()) : [],
      alternatePhone: (alternatePhone || '').trim(),
      website: (website || '').trim(),
      industry: industry || 'Technology',
      accountRelationship: accountRelationship || 'Customer',
      plan: (plan || '').trim(),
      serverNode: (serverNode || '').trim(),
      // Lifecycle is system-derived; a brand-new account has taken nothing yet.
      status: 'Inactive',
      registered: new Date().toISOString().split('T')[0],
      mrr: (mrr || '').trim(),
      city: cityLoc,
      address: {
        street: address?.street || '',
        area: address?.area || '',
        city: city,
        state: state,
        country: address?.country || 'India',
        postalCode: address?.postalCode || '',
        // Nothing is typed on the create form any more, so the register stores
        // what was sent instead of claiming an office/billing address.
        addressType: address?.addressType || ''
      },
      gstNo: (gstNo || '').trim().toUpperCase(),
      tallySerialNo: (tallySerialNo || '').trim(),
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
    } else {
      // Only Mongoose stamps the dates for us; the register has to do it itself.
      const stamp = new Date().toISOString();
      savedCustomer = { ...savedCustomer, createdAt: stamp, updatedAt: stamp };
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
        status: 'pending',
        recordId: null,
        lastSyncedAt: syncResult.disabled ? null : new Date().toISOString(),
        syncError: syncResult.disabled ? 'Sangam CRM synchronization disabled in configuration.' : syncResult.message
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

    // Ensure corresponding User account exists in 'users' collection for login
    try {
      if (isMongoConnected()) {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (!existingUser) {
          await User.create({
            name: fullName,
            email: cleanEmail,
            phone: cleanPhone,
            password: rawPassword,
            portalPassword: rawPassword,
            role: 'customer',
            customerId: customerId,
            // Login availability is separate from the commercial lifecycle:
            // an Inactive or Demo customer must still reach the portal.
            accountStatus: 'active'
          });
        } else {
          existingUser.name = fullName;
          existingUser.customerId = customerId;
          existingUser.portalPassword = rawPassword;
          if (req.body.password) existingUser.password = rawPassword;
          await existingUser.save();
        }
      }
    } catch (userSyncErr) {
      console.warn('[CustomerController] User account creation note:', userSyncErr.message);
    }

    // A new account can share a company name with an existing contract register;
    // derive what the records prove instead of assuming a blank slate.
    const lifecycleChanges = await refreshCustomerLifecycle({
      customerId,
      email: cleanEmail,
      company: companyName
    }).catch((err) => {
      console.warn('[CustomerController] Lifecycle refresh note:', err.message);
      return [];
    });
    if (lifecycleChanges.length > 0) savedCustomer.status = lifecycleChanges[0].status;

    await logNotification({
      type: 'customer_created',
      title: 'Customer Created',
      message: `Customer "${savedCustomer.name}" (${savedCustomer.company || savedCustomer.email}) was registered.`,
      severity: 'success',
      entityType: 'customer',
      entityId: savedCustomer.customerId || savedCustomer._id,
      user: {
        name: savedCustomer.name,
        email: savedCustomer.email,
        company: savedCustomer.company
      },
      metadata: {
        customerId: savedCustomer.customerId,
        plan: savedCustomer.plan,
        mrr: savedCustomer.mrr
      }
    });

    await logActivity(req, {
      action: 'CREATE_CUSTOMER',
      category: 'customer',
      resource: 'Customer',
      resourceId: savedCustomer.customerId,
      details: `Created customer "${savedCustomer.name}" (${savedCustomer.company || savedCustomer.email})`,
      changes: {
        customerId: savedCustomer.customerId,
        name: savedCustomer.name,
        company: savedCustomer.company,
        email: savedCustomer.email,
        phone: savedCustomer.phone,
        plan: savedCustomer.plan,
        mrr: savedCustomer.mrr,
        status: savedCustomer.status,
        serverNode: savedCustomer.serverNode
      }
    });

    return res.status(201).json({
      success: true,
      customer: savedCustomer,
      sangamCrm: savedCustomer.sangamCrm,
      message: syncResult.success
        ? `Customer saved locally and synchronized to Sangam CRM Companies (Record ID: ${savedCustomer.sangamCrm.recordId})`
        : syncResult.disabled
        ? 'Customer created and saved in database successfully. (Sangam CRM sync is disabled)'
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

    if (!sangamCrmService.isSyncEnabled()) {
      return res.status(200).json({
        success: false,
        disabled: true,
        sangamCrm: customer.sangamCrm || { status: 'pending', recordId: null },
        message: 'Sangam CRM synchronization is currently disabled in .env (SANGAM_CRM_SYNC_ENABLED=false).'
      });
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
      firstName,
      lastName,
      designation,
      company,
      email,
      phone,
      additionalEmails,
      additionalPhones,
      alternatePhone,
      website,
      industry,
      accountRelationship,
      plan,
      serverNode,
      mrr,
      address,
      gstNo,
      tallySerialNo
    } = req.body;

    // The register keeps one display name, so an edit that only touches the
    // two halves still leaves a readable name behind.
    const joinedName = String(name || '').trim() ||
      [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean).join(' ');

    const updatedData = {
      ...(joinedName && { name: joinedName }),
      ...(firstName !== undefined && { firstName: String(firstName).trim() }),
      ...(lastName !== undefined && { lastName: String(lastName).trim() }),
      ...(designation !== undefined && { designation: String(designation).trim() }),
      ...((company || joinedName) && { company: (company || joinedName).trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(additionalEmails !== undefined && {
        additionalEmails: Array.isArray(additionalEmails)
          ? additionalEmails.filter(Boolean).map(e => String(e).trim().toLowerCase())
          : []
      }),
      ...(phone && { phone: phone.trim() }),
      ...(additionalPhones !== undefined && {
        additionalPhones: Array.isArray(additionalPhones)
          ? additionalPhones.filter(Boolean).map(p => String(p).trim())
          : []
      }),
      ...(alternatePhone !== undefined && { alternatePhone: alternatePhone.trim() }),
      ...(website !== undefined && { website: website.trim() }),
      ...(industry && { industry }),
      ...(accountRelationship && { accountRelationship }),
      ...(plan && { plan }),
      ...(serverNode && { serverNode }),
      ...(mrr && { mrr }),
      ...(address && { address }),
      ...(gstNo !== undefined && { gstNo: gstNo.trim().toUpperCase() }),
      ...(tallySerialNo !== undefined && { tallySerialNo: String(tallySerialNo).trim() })
    };

    let savedCustomer = null;
    if (isMongoConnected()) {
      savedCustomer = await Customer.findOneAndUpdate(query, { $set: updatedData }, { new: true }).lean();
    } else {
      const fileList = getCustomersFromFile();
      const idx = fileList.findIndex((c) => c.customerId === id || c.id === id || c._id === id);
      if (idx !== -1) {
        fileList[idx] = { ...fileList[idx], ...updatedData, updatedAt: new Date().toISOString() };
        saveCustomersToFile(fileList);
        savedCustomer = fileList[idx];
      }
    }

    if (!savedCustomer) {
      savedCustomer = { ...customer.toObject?.() || customer, ...updatedData };
    }

    // Lifecycle is derived from the contract and payment registers, never
    // hand-edited; an email or company rename can re-link records, so re-derive.
    const lifecycleChanges = await refreshCustomerLifecycle({
      customerId: savedCustomer.customerId,
      email: savedCustomer.email,
      company: savedCustomer.company
    }).catch((err) => {
      console.warn('[CustomerController] Lifecycle refresh note:', err.message);
      return [];
    });
    if (lifecycleChanges.length > 0) savedCustomer.status = lifecycleChanges[0].status;

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

    // Keep linked User account in sync
    try {
      if (isMongoConnected() && (savedCustomer.customerId || savedCustomer.email)) {
        const userUpdates = {};
        if (savedCustomer.name) userUpdates.name = savedCustomer.name;
        if (savedCustomer.phone) userUpdates.phone = savedCustomer.phone;
        if (savedCustomer.company) userUpdates.company = savedCustomer.company;
        if (savedCustomer.gstNo) userUpdates.gstNo = savedCustomer.gstNo;
        if (savedCustomer.designation) userUpdates.designation = savedCustomer.designation;
        if (savedCustomer.additionalEmails !== undefined) userUpdates.additionalEmails = savedCustomer.additionalEmails;
        if (savedCustomer.additionalPhones !== undefined) userUpdates.additionalPhones = savedCustomer.additionalPhones;

        await User.findOneAndUpdate(
          { $or: [{ customerId: savedCustomer.customerId }, { email: savedCustomer.email }] },
          { $set: userUpdates }
        );
      }
    } catch (uErr) {
      console.warn('[CustomerController] User update sync note:', uErr.message);
    }

    await logNotification({
      type: 'customer_updated',
      title: 'Customer Updated',
      message: `Customer "${savedCustomer.name}" (${savedCustomer.company || savedCustomer.email}) details were updated.`,
      severity: 'info',
      entityType: 'customer',
      entityId: savedCustomer.customerId || savedCustomer._id,
      user: {
        name: savedCustomer.name,
        email: savedCustomer.email,
        company: savedCustomer.company
      },
      metadata: { customerId: savedCustomer.customerId }
    });

    const previousRecord = customer.toObject?.() || customer;
    const beforeSlice = {};
    const afterSlice = {};
    Object.keys(updatedData).forEach((key) => {
      if (String(previousRecord[key] ?? '') !== String(updatedData[key] ?? '')) {
        beforeSlice[key] = previousRecord[key] ?? '';
        afterSlice[key] = updatedData[key];
      }
    });

    await logActivity(req, {
      action: 'UPDATE_CUSTOMER',
      category: 'customer',
      resource: 'Customer',
      resourceId: savedCustomer.customerId,
      details: `Updated customer details for "${savedCustomer.name}" (${savedCustomer.customerId})`,
      changes: {
        customerId: savedCustomer.customerId,
        before: beforeSlice,
        after: afterSlice
      }
    });

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

    let deletedCustomer = null;
    if (isMongoConnected()) {
      deletedCustomer = await Customer.findOneAndDelete(query);
      if (deletedCustomer?.email) {
        try {
          await User.findOneAndDelete({ email: deletedCustomer.email.toLowerCase(), role: 'customer' });
        } catch (uErr) {
          console.warn('[CustomerController] User delete sync note:', uErr.message);
        }
      }
    }

    const fileList = getCustomersFromFile().filter(
      (c) => c.customerId !== id && c.id !== id && c._id !== id
    );
    saveCustomersToFile(fileList);

    await logNotification({
      type: 'customer_deleted',
      title: 'Customer Deleted',
      message: `Customer account (${id}) was deleted.`,
      severity: 'warning',
      entityType: 'customer',
      entityId: id,
      user: {
        name: deletedCustomer?.name || '',
        email: deletedCustomer?.email || '',
        company: deletedCustomer?.company || ''
      }
    });

    await logActivity(req, {
      action: 'DELETE_CUSTOMER',
      category: 'customer',
      resource: 'Customer',
      resourceId: id,
      details: `Deleted customer account "${deletedCustomer?.name || id}" (${deletedCustomer?.email || ''})`,
      changes: {
        deletedCustomer: {
          id,
          customerId: deletedCustomer?.customerId || id,
          name: deletedCustomer?.name,
          email: deletedCustomer?.email,
          company: deletedCustomer?.company
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Customer ${id} deleted successfully.`
    });
  } catch (err) {
    console.error('[CustomerController] deleteCustomer error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete customer.' });
  }
};

/**
 * Helper to generate a memorable temporary customer password for dashboard login
 */
export const generateCustomerPassword = (companyOrName) => {
  const cleanWord = (companyOrName || 'Client')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 6) || 'Nispl';
  const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${capitalized}@${randomDigits}`;
};

/**
 * Bulk Import Companies from CSV
 * Maps exact CSV fields, saves to database, syncs to Sangam CRM Account module,
 * and generates customer login credentials (username & password).
 */
export const importCompanies = async (req, res) => {
  try {
    const companies = Array.isArray(req.body.companies) ? req.body.companies : [];
    if (!companies.length) {
      return res.status(400).json({ success: false, error: 'No company records provided for import.' });
    }

    const results = [];
    const credentials = [];
    let succeededCount = 0;
    let failedCount = 0;

    for (let i = 0; i < companies.length; i++) {
      const item = companies[i];
      const accountName = (item.accountName || item.company || item.name || '').trim();
      const cleanEmail = (item.email || '').trim().toLowerCase();
      const cleanPhone = (item.phone || item.mobile || '').trim();

      if (!accountName || !cleanEmail || !cleanPhone) {
        results.push({
          row: i + 1,
          accountName: accountName || 'Unknown',
          email: cleanEmail,
          ok: false,
          error: 'Account Name, Email, and Phone are required.'
        });
        failedCount++;
        continue;
      }

      try {
        const street = item.addressStreet || item.street || '';
        const area = item.addressArea || item.area || '';
        const city = item.addressCity || item.city || 'Valsad';
        const state = item.addressState || item.state || 'Gujarat';
        const country = item.addressCountry || item.country || 'India';
        const postalCode = item.addressPostalCode || item.postalCode || item.postal_code || '';
        const rawStatus = (item.accountStatus || item.status || 'Active').toLowerCase();
        const status = rawStatus === 'inactive' ? 'inactive' : 'active';
        const industry = item.industry || 'Technology';
        const gstin = (item.gstin || item.gstNo || '').trim().toUpperCase();
        const pan = (item.pan || '').trim().toUpperCase();
        const website = (item.website || '').trim();
        const tallySerialNo = (item.tallySerialNo || item.tallySlNo || '').trim();

        // Check if customer already exists by email or phone or company
        let existingCustomer = null;
        if (isMongoConnected()) {
          existingCustomer = await Customer.findOne({
            $or: [{ email: cleanEmail }, { phone: cleanPhone }, { company: accountName }]
          });
        } else {
          const fileList = getCustomersFromFile();
          existingCustomer = fileList.find(
            (c) =>
              (c.email && c.email.toLowerCase() === cleanEmail) ||
              (c.phone && c.phone === cleanPhone) ||
              (c.company && c.company.toLowerCase() === accountName.toLowerCase())
          );
        }

        const customerId = existingCustomer?.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const customerPayload = {
          customerId,
          id: customerId,
          name: accountName,
          company: accountName,
          email: cleanEmail,
          phone: cleanPhone,
          website,
          industry,
          accountRelationship: 'Customer',
          plan: String(item.plan || '').trim(),
          serverNode: String(item.serverNode || '').trim(),
          // The sheet's accountStatus gates login only; the commercial lifecycle
          // starts Inactive and is derived from the contract/payment registers.
          status: 'Inactive',
          registered: item.autoUpdatedAt
            ? new Date(item.autoUpdatedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          mrr: String(item.mrr || '').trim(),
          city: `${city}, ${state}`,
          address: {
            street,
            area,
            city,
            state,
            country,
            postalCode,
            addressType: 'Office / Billing'
          },
          gstNo: gstin,
          pan,
          tallySerialNo,
          sangamCrm: existingCustomer?.sangamCrm || {
            status: 'pending',
            recordId: null,
            lastSyncedAt: null,
            syncError: null
          }
        };

        // 1. Save or update local Customer
        let savedCustomer = customerPayload;
        if (isMongoConnected()) {
          if (existingCustomer) {
            savedCustomer = await Customer.findByIdAndUpdate(
              existingCustomer._id,
              { $set: customerPayload },
              { new: true }
            );
          } else {
            const doc = new Customer(customerPayload);
            await doc.save();
            savedCustomer = doc.toJSON();
          }
        }
        const fileList = getCustomersFromFile();
        const filteredFiles = fileList.filter((c) => c.customerId !== customerId);
        saveCustomersToFile([savedCustomer, ...filteredFiles]);

        // 2. Synchronize to Sangam CRM Companies (Account)
        const crmResult = await sangamCrmService.createOrUpdateCompany(savedCustomer);
        if (crmResult.success) {
          savedCustomer.sangamCrm = {
            status: 'synced',
            recordId: crmResult.recordId,
            lastSyncedAt: new Date().toISOString(),
            syncError: null
          };
        } else {
          savedCustomer.sangamCrm = {
            status: 'failed',
            recordId: null,
            lastSyncedAt: new Date().toISOString(),
            syncError: crmResult.message
          };
        }

        if (isMongoConnected()) {
          await Customer.findOneAndUpdate(
            { customerId: savedCustomer.customerId },
            { $set: { sangamCrm: savedCustomer.sangamCrm } }
          );
        }
        const updatedFiles = getCustomersFromFile().map((c) =>
          c.customerId === savedCustomer.customerId ? { ...c, sangamCrm: savedCustomer.sangamCrm } : c
        );
        saveCustomersToFile(updatedFiles);

        // 3. Generate Username & Password for Dashboard Login
        const plainPassword = generateCustomerPassword(accountName);
        savedCustomer.portalPassword = plainPassword;
        savedCustomer.loginEmail = cleanEmail;
        if (isMongoConnected()) {
          await Customer.findOneAndUpdate(
            { customerId: savedCustomer.customerId },
            { $set: { portalPassword: plainPassword, loginEmail: cleanEmail } }
          );
          const existingUser = await User.findOne({
            $or: [{ email: cleanEmail }, { customerId }]
          }).select('+password');

          if (!existingUser) {
            await User.create({
              name: accountName,
              email: cleanEmail,
              password: plainPassword,
              portalPassword: plainPassword,
              role: 'customer',
              customerId: customerId,
              accountStatus: status
            });
          } else {
            existingUser.name = accountName;
            existingUser.email = cleanEmail;
            existingUser.customerId = customerId;
            existingUser.accountStatus = status;
            existingUser.password = plainPassword;
            existingUser.portalPassword = plainPassword;
            await existingUser.save();
          }
        }

        await refreshCustomerLifecycle({ customerId, email: cleanEmail, company: accountName }).catch((err) =>
          console.warn('[CustomerController] Import lifecycle note:', err.message)
        );

        credentials.push({
          company: accountName,
          name: accountName,
          customerId,
          username: customerId,
          email: cleanEmail,
          password: plainPassword,
          role: 'customer',
          status,
          loginUrl: '/customer/login'
        });

        results.push({
          row: i + 1,
          accountName,
          customerId,
          email: cleanEmail,
          sangamRecordId: savedCustomer.sangamCrm?.recordId || null,
          sangamStatus: savedCustomer.sangamCrm?.status || 'pending',
          ok: true
        });
        succeededCount++;
      } catch (rowErr) {
        results.push({
          row: i + 1,
          accountName,
          email: cleanEmail,
          ok: false,
          error: rowErr.message
        });
        failedCount++;
      }
    }

    await logNotification({
      type: 'customer_created',
      title: 'Bulk Companies Import',
      message: `Imported ${succeededCount} company records with auto-generated customer login credentials.`,
      severity: 'success',
      entityType: 'customer',
      metadata: { total: companies.length, succeeded: succeededCount, failed: failedCount }
    });

    await logActivity(req, {
      action: 'IMPORT_COMPANIES',
      category: 'customer',
      resource: 'Customer',
      details: `Bulk imported ${succeededCount} companies from CSV with generated login credentials. (${failedCount} failed)`,
      changes: { total: companies.length, succeeded: succeededCount, failed: failedCount }
    });

    return res.status(200).json({
      success: true,
      total: companies.length,
      succeeded: succeededCount,
      failed: failedCount,
      results,
      credentials
    });
  } catch (err) {
    console.error('[CustomerController] importCompanies error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Bulk Import Contacts from CSV
 * Maps First Name, Last Name, Account Name, Phone, Email, Designation.
 * Links to existing companies, syncs to Sangam CRM Contact module,
 * and generates customer login credentials.
 */
export const importContacts = async (req, res) => {
  try {
    const contacts = Array.isArray(req.body.contacts) ? req.body.contacts : [];
    if (!contacts.length) {
      return res.status(400).json({ success: false, error: 'No contact records provided for import.' });
    }

    const results = [];
    const credentials = [];
    let succeededCount = 0;
    let failedCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      const item = contacts[i];
      const firstName = (item.firstName || item.first_name || '').trim();
      const lastName = (item.lastName || item.last_name || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || item.name || 'Contact';
      const cleanEmail = (item.email || '').trim().toLowerCase();
      const cleanPhone = (item.phone || item.mobile || '').trim();
      const accountName = (item.accountName || item.account_name || item.company || '').trim();
      const designation = (item.designation || item.title || '').trim();

      if (!cleanEmail && !cleanPhone && !fullName) {
        results.push({
          row: i + 1,
          name: fullName,
          email: cleanEmail,
          ok: false,
          error: 'At least Name and Email or Phone are required.'
        });
        failedCount++;
        continue;
      }

      try {
        // Find existing customer by Account Name or Email
        let matchedCustomer = null;
        if (isMongoConnected()) {
          if (accountName) {
            matchedCustomer = await Customer.findOne({
              company: new RegExp(`^${accountName}$`, 'i')
            });
          }
          if (!matchedCustomer && cleanEmail) {
            matchedCustomer = await Customer.findOne({ email: cleanEmail });
          }
        } else {
          const fileList = getCustomersFromFile();
          if (accountName) {
            matchedCustomer = fileList.find(
              (c) => c.company && c.company.toLowerCase() === accountName.toLowerCase()
            );
          }
          if (!matchedCustomer && cleanEmail) {
            matchedCustomer = fileList.find(
              (c) => c.email && c.email.toLowerCase() === cleanEmail
            );
          }
        }

        let customerId = matchedCustomer?.customerId;
        let crmAccountId = matchedCustomer?.sangamCrm?.recordId;

        // If no matching customer exists, create a Customer record so data is tracked in DB
        if (!matchedCustomer) {
          customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
          const newCustData = {
            customerId,
            id: customerId,
            name: fullName,
            company: accountName || `${fullName} (Individual)`,
            email: cleanEmail || `customer.${Date.now()}@nispl.in`,
            phone: cleanPhone,
            industry: 'Technology',
            accountRelationship: 'Customer',
            status: 'Inactive',
            registered: new Date().toISOString().split('T')[0],
            address: { street: '', area: '', city: '', state: '', country: '', postalCode: '', addressType: '' },
            contacts: [
              {
                firstName,
                lastName,
                name: fullName,
                phone: cleanPhone,
                email: cleanEmail,
                designation
              }
            ],
            sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
          };

          if (isMongoConnected()) {
            const doc = new Customer(newCustData);
            await doc.save();
            matchedCustomer = doc.toJSON();
          } else {
            matchedCustomer = newCustData;
            saveCustomersToFile([newCustData, ...getCustomersFromFile()]);
          }

          // Sync new Company to Sangam CRM
          const compSync = await sangamCrmService.createOrUpdateCompany(matchedCustomer);
          if (compSync.success) {
            crmAccountId = compSync.recordId;
            matchedCustomer.sangamCrm = {
              status: 'synced',
              recordId: crmAccountId,
              lastSyncedAt: new Date().toISOString(),
              syncError: null
            };
            if (isMongoConnected()) {
              await Customer.findByIdAndUpdate(matchedCustomer._id, { $set: { sangamCrm: matchedCustomer.sangamCrm } });
            }
          }
        } else {
          // Add contact to matchedCustomer contacts array
          const contactObj = {
            firstName,
            lastName,
            name: fullName,
            phone: cleanPhone,
            email: cleanEmail,
            designation
          };
          if (isMongoConnected()) {
            await Customer.findByIdAndUpdate(matchedCustomer._id, {
              $push: { contacts: contactObj }
            });
          }
        }

        // Sync Contact to Sangam CRM -> Contact module
        const contactSync = await sangamCrmService.createOrUpdateContact(
          {
            firstName,
            lastName,
            name: fullName,
            email: cleanEmail,
            phone: cleanPhone,
            designation,
            accountName: accountName || matchedCustomer?.company
          },
          crmAccountId
        );

        // Generate Username & Password for Dashboard Login (if email present)
        let plainPassword = null;
        if (cleanEmail) {
          plainPassword = generateCustomerPassword(firstName || fullName);
          if (matchedCustomer) {
            matchedCustomer.portalPassword = plainPassword;
            matchedCustomer.loginEmail = cleanEmail;
            if (isMongoConnected() && matchedCustomer._id) {
              await Customer.findByIdAndUpdate(matchedCustomer._id, {
                $set: { portalPassword: plainPassword, loginEmail: cleanEmail }
              });
            }
          }
          if (isMongoConnected()) {
            const existingUser = await User.findOne({ email: cleanEmail }).select('+password');
            if (!existingUser) {
              await User.create({
                name: fullName,
                email: cleanEmail,
                password: plainPassword,
                portalPassword: plainPassword,
                role: 'customer',
                customerId: customerId,
                designation,
                accountStatus: 'active'
              });
            } else {
              existingUser.name = fullName;
              existingUser.customerId = customerId;
              existingUser.designation = designation;
              existingUser.password = plainPassword;
              existingUser.portalPassword = plainPassword;
              await existingUser.save();
            }
          }

          credentials.push({
            name: fullName,
            company: accountName || matchedCustomer?.company || 'Personal Account',
            customerId,
            username: customerId,
            email: cleanEmail,
            password: plainPassword,
            designation,
            role: 'customer',
            status: 'active',
            loginUrl: '/customer/login'
          });
        }

        results.push({
          row: i + 1,
          name: fullName,
          email: cleanEmail,
          accountName: accountName || matchedCustomer?.company,
          customerId,
          sangamContactId: contactSync.recordId || null,
          sangamStatus: contactSync.success ? 'synced' : 'pending',
          ok: true
        });
        succeededCount++;
      } catch (rowErr) {
        results.push({
          row: i + 1,
          name: fullName,
          email: cleanEmail,
          ok: false,
          error: rowErr.message
        });
        failedCount++;
      }
    }

    await logNotification({
      type: 'customer_created',
      title: 'Bulk Contacts Import',
      message: `Imported ${succeededCount} contact records and generated dashboard login credentials.`,
      severity: 'success',
      entityType: 'customer',
      metadata: { total: contacts.length, succeeded: succeededCount, failed: failedCount }
    });

    await logActivity(req, {
      action: 'IMPORT_CONTACTS',
      category: 'customer',
      resource: 'Customer',
      details: `Bulk imported ${succeededCount} contacts from CSV with generated login credentials. (${failedCount} failed)`,
      changes: { total: contacts.length, succeeded: succeededCount, failed: failedCount }
    });

    return res.status(200).json({
      success: true,
      total: contacts.length,
      succeeded: succeededCount,
      failed: failedCount,
      results,
      credentials
    });
  } catch (err) {
    console.error('[CustomerController] importContacts error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const allowDemoExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const additionalDays = Math.max(1, parseInt(req.body?.additionalDays || req.body?.days, 10) || 7);
    const notes = String(req.body?.notes || 'Authorized by administrator').trim();

    let customer = null;
    if (isMongoConnected()) {
      customer = await Customer.findOne({
        $or: [
          { customerId: id },
          { _id: mongoose.isValidObjectId(id) ? id : null },
          { email: id },
          { email: new RegExp(`^${id}$`, 'i') }
        ]
      });
    }

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    customer.demoExtensionAllowed = true;
    customer.demoExtensionDays = additionalDays;
    await customer.save();

    // Apply the extension immediately on any LIVE demo trial contract, not just
    // stamp an authorization. The customer portal reads the renewal date from
    // the contract's own expiry, so moving expiryDate is what makes the extra
    // trial days visibly show up on the customer's overview right away.
    let appliedTo = 0;
    let latestExtendedExpiry = null;
    if (isMongoConnected()) {
      const trialMatcher = {
        $and: [
          {
            $or: [
              { email: customer.email },
              { email: new RegExp(`^${customer.email}$`, 'i') },
              { customer: customer.name },
              { company: customer.company }
            ]
          },
          {
            $or: [
              { contractType: 'Trial' },
              { productCategory: 'Trial' },
              { isDemoTrial: true }
            ]
          }
        ]
      };

      const trialContracts = await Contract.find(trialMatcher);
      for (const trial of trialContracts) {
        const stillDemo = String(trial.status || '').toUpperCase() === 'DEMO';
        if (stillDemo) {
          const now = new Date();
          const currentExpiry = trial.expiryDate ? new Date(trial.expiryDate) : null;
          // Extend from the existing future expiry; an already-lapped trial gets
          // the extra days measured from today.
          const base = currentExpiry && !Number.isNaN(currentExpiry.getTime()) && currentExpiry > now ? currentExpiry : now;
          const extended = new Date(base.getTime() + additionalDays * 24 * 60 * 60 * 1000);
          const isoDate = extended.toISOString().slice(0, 10);
          trial.expiryDate = isoDate;
          trial.endDate = isoDate;
          trial.status = 'DEMO';
          // The authorization is consumed here — the admin already spent it.
          trial.extensionAllowed = false;
          trial.extensionDays = 0;
          trial.description = `Demo trial extended by administrator until ${isoDate} (+${additionalDays} days). ${notes}`;
          await trial.save();
          appliedTo++;
          latestExtendedExpiry = isoDate;
        } else {
          // Non-active trial rows only carry the authorization for later flows.
          trial.extensionAllowed = true;
          trial.extensionDays = additionalDays;
          await trial.save();
        }
      }

      // Once the extension is already applied to the live trial, the customer
      // must not be able to double-apply the same authorization themselves.
      if (appliedTo > 0) {
        customer.demoExtensionAllowed = false;
        await customer.save();
      }
    }
    const extendedExpiryForResponse = appliedTo > 0 && latestExtendedExpiry ? latestExtendedExpiry : null;

    await logNotification({
      type: 'demo_extension_authorized',
      title: 'Demo Trial Extension Authorized',
      message: `Administrator authorized ${additionalDays} additional trial days for ${customer.name || customer.company} (${customer.email}).`,
      severity: 'info',
      entityType: 'customer',
      entityId: customer.customerId || customer.email,
      metadata: { customerId: customer.customerId, email: customer.email, additionalDays, notes }
    });

    await logActivity(req, {
      action: 'DEMO_EXTENSION_AUTHORIZED',
      category: 'customer',
      resource: 'Customer',
      resourceId: customer.customerId,
      details: `Authorized ${additionalDays} additional trial days for ${customer.email}. (${notes})`
    });

    res.json({
      success: true,
      message: appliedTo > 0 && extendedExpiryForResponse
        ? `Successfully extended the demo trial for ${customer.name || customer.company} by ${additionalDays} days, now valid until ${extendedExpiryForResponse}.`
        : `Successfully authorized ${additionalDays} additional demo trial days for ${customer.name || customer.company}.`,
      data: {
        customerId: customer.customerId,
        email: customer.email,
        demoExtensionAllowed: appliedTo === 0,
        demoExtensionDays: additionalDays,
        trialsExtended: appliedTo,
        newTrialExpiry: extendedExpiryForResponse
      }
    });
  } catch (err) {
    console.error('Error authorizing demo extension:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Helper date parser for CSV inputs (accepts DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.)
 */
const parseMasterDate = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    const iso = `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    return Number.isNaN(Date.parse(iso)) ? '' : iso;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
};

/**
 * Helper value formatter for amounts
 */
const formatMasterAmount = (value) => {
  const digits = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return digits ? `₹${Number(digits[0]).toLocaleString('en-IN')}` : '';
};

/**
 * Unified Master CSV Bulk Import
 * Parses a single comprehensive CSV containing Company, Contact, Contract, and Payment data.
 * - Customer: Provisioned with login credentials; if Payment Status is 'Yes' -> 'Active', if 'No' -> 'Demo'
 * - Contract: Registered and synchronized to Sangam CRM Contracts module
 * - Payment: If Payment Status is 'Yes' -> Settled payment recorded in ledger
 * - Receipt: If Payment Status is 'Yes' -> Official receipt generated automatically
 */
export const importMaster = async (req, res) => {
  try {
    const rows = Array.isArray(req.body.records) ? req.body.records : [];
    if (!rows.length) {
      return res.status(400).json({ success: false, error: 'No master CSV records provided for import.' });
    }

    const raisedBy = req.user
      ? { name: req.user.name || '', email: req.user.email || '', role: req.user.role || '' }
      : { name: '', email: '', role: '' };

    const results = [];
    const credentials = [];
    let succeededCount = 0;
    let failedCount = 0;
    let activeCount = 0;
    let demoCount = 0;
    let paymentsCount = 0;
    let receiptsCount = 0;
    let crmSyncCount = 0;
    const touchedIdentities = new Map();

    const year = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i] || {};

      // 1. Company & Contact Extraction
      const company = (item.companyName || item.company || item.accountName || item.name || '').trim();
      const contactPerson = (item.contactPerson || item.person || item.customerName || item.customer || item.name || company).trim();
      const email = (item.email || item.corporateEmail || item.mail || '').trim().toLowerCase();
      const phone = (item.phone || item.mobile || item.phoneNumber || '0000000000').trim();
      const designation = (item.designation || item.role || 'Customer').trim();
      const industry = (item.industry || 'Technology').trim();
      const tallySerialNo = (item.tallySerialNo || item.tallySlNo || '').trim();
      const street = (item.address || item.addressStreet || item.street || '').trim();
      const city = (item.city || item.addressCity || 'Valsad').trim();
      const state = (item.state || item.addressState || 'Gujarat').trim();
      const country = (item.country || item.addressCountry || 'India').trim();
      const postalCode = (item.postalCode || item.pincode || item.addressPostalCode || '').trim();
      const gstin = (item.gstin || item.gstNo || '').trim().toUpperCase();
      const pan = (item.pan || '').trim().toUpperCase();
      const website = (item.website || '').trim();

      // 2. Contract Extraction
      const contractName = (item.contractId || item.contractName || item.agreement || `${company} Cloud Services Agreement`).trim();
      const service = (item.service || item.product || item.productName || 'Tally Prime Cloud Server').trim();
      const contractType = (item.contractType || 'Comprehensive').trim();
      const duration = (item.duration || item.subscriptionPeriod || '1 Year').trim();
      const productCategory = (item.productCategory || 'Software').trim();
      const rawTotalValue = item.totalContractValue ?? item.value ?? item.amount ?? '0';
      const formattedTotalValue = formatMasterAmount(rawTotalValue) || '₹0';

      const startDate = parseMasterDate(item.startDate) || today;
      let endDate = parseMasterDate(item.endDate || item.expiryDate);
      if (!endDate) {
        const nextY = new Date(startDate);
        nextY.setFullYear(nextY.getFullYear() + 1);
        endDate = nextY.toISOString().split('T')[0];
      }
      const orderDate = parseMasterDate(item.orderDate) || startDate;

      // 3. Payment Status Extraction (Yes -> Active, No -> Demo)
      const rawPaymentStatus = String(item.paymentStatus || item.paid || item.isPaid || '').trim().toLowerCase();
      const isPaid = ['yes', 'true', '1', 'paid', 'y', 'active'].includes(rawPaymentStatus);
      const paymentStatus = isPaid ? 'Yes' : 'No';
      const customerStatus = isPaid ? 'Active' : 'Demo';
      const contractStatus = isPaid ? 'In Progress' : 'DEMO';

      const paymentMethod = (item.paymentMode || item.paymentMethod || item.method || 'NEFT Wire').trim();
      const referenceNumber = (item.referenceNumber || item.chequeNumber || item.chequeNo || item.utr || '').trim();
      const bankName = (item.bankName || item.bankBranch || item.bank || '').trim();
      const salesPerson = (item.salesPerson || raisedBy.name || raisedBy.email || 'Online Customer Portal').trim();
      const slaTier = (item.slaTier || 'Tier-1 Priority NOC 99.99%').trim();
      const description = (item.description || item.notes || '').trim();

      if (!company || !email) {
        results.push({
          row: i + 1,
          company: company || 'Unknown',
          ok: false,
          error: 'Company Name and Email are required.'
        });
        failedCount++;
        continue;
      }

      try {
        // -------------------------------------------------------------
        // STEP A: Customer Provisioning & Credentials Generation
        // -------------------------------------------------------------
        let existingCustomer = null;
        if (isMongoConnected()) {
          existingCustomer = await Customer.findOne({
            $or: [
              { email },
              { phone: phone !== '0000000000' ? phone : '__none__' },
              { company: new RegExp(`^${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            ]
          });
        } else {
          const fileCustomers = getCustomersFromFile();
          existingCustomer = fileCustomers.find(
            (c) =>
              (c.email && c.email.toLowerCase() === email) ||
              (phone !== '0000000000' && c.phone && c.phone === phone) ||
              (c.company && c.company.toLowerCase() === company.toLowerCase())
          );
        }

        const customerId = existingCustomer?.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const plainPassword = existingCustomer?.portalPassword || generateCustomerPassword(company || contactPerson);

        const customerPayload = {
          customerId,
          id: customerId,
          name: contactPerson,
          company,
          email,
          loginEmail: email,
          portalPassword: plainPassword,
          phone,
          website,
          industry,
          accountRelationship: 'Customer',
          plan: service,
          status: customerStatus,
          designation,
          addressCity: city,
          addressState: state,
          addressCountry: country,
          addressPostalCode: postalCode,
          gstNo: gstin,
          pan,
          tallySerialNo,
          address: [
            {
              street,
              area: '',
              city,
              state,
              country,
              postalCode,
              type: 'Billing'
            }
          ]
        };

        let savedCustomer = null;
        if (isMongoConnected()) {
          if (existingCustomer) {
            savedCustomer = await Customer.findByIdAndUpdate(
              existingCustomer._id,
              { $set: customerPayload },
              { new: true }
            ).lean();
          } else {
            const doc = new Customer(customerPayload);
            savedCustomer = (await doc.save()).toObject();
          }

          // Ensure corresponding User account exists in 'users' collection for login
          try {
            const existingUser = await User.findOne({
              $or: [{ email }, { customerId }]
            }).select('+password');

            if (!existingUser) {
              await User.create({
                name: contactPerson,
                email,
                phone,
                company,
                password: plainPassword,
                portalPassword: plainPassword,
                role: 'customer',
                customerId,
                accountStatus: customerStatus,
                isEmailVerified: true
              });
            } else {
              existingUser.name = contactPerson;
              existingUser.email = email;
              existingUser.company = company;
              existingUser.customerId = customerId;
              existingUser.accountStatus = customerStatus;
              existingUser.portalPassword = plainPassword;
              await existingUser.save();
            }
          } catch (uErr) {
            console.warn('[MasterImport] User sync note:', uErr.message);
          }
        } else {
          const fileCustomers = getCustomersFromFile();
          const idx = fileCustomers.findIndex((c) => c.customerId === customerId || c.email?.toLowerCase() === email);
          if (idx !== -1) {
            fileCustomers[idx] = { ...fileCustomers[idx], ...customerPayload, updatedAt: new Date().toISOString() };
            savedCustomer = fileCustomers[idx];
          } else {
            savedCustomer = { ...customerPayload, createdAt: new Date().toISOString() };
            fileCustomers.unshift(savedCustomer);
          }
          saveCustomersToFile(fileCustomers);
        }

        // Sync Customer Account to Sangam CRM
        let sangamAccountId = savedCustomer?.sangamCrm?.recordId || null;
        if (!sangamAccountId || sangamAccountId.startsWith('SGM-ACC-')) {
          try {
            const crmAccRes = await sangamCrmService.createOrUpdateCompany(savedCustomer);
            if (crmAccRes.success && crmAccRes.recordId) {
              sangamAccountId = crmAccRes.recordId;
              if (isMongoConnected()) {
                await Customer.updateOne(
                  { customerId },
                  { $set: { 'sangamCrm.status': 'synced', 'sangamCrm.recordId': sangamAccountId, 'sangamCrm.lastSyncedAt': new Date() } }
                );
              }
            }
          } catch (accSyncErr) {
            console.warn('[MasterImport] CRM account sync note:', accSyncErr.message);
          }
        }

        credentials.push({
          name: contactPerson,
          company,
          customerId,
          username: customerId,
          email,
          password: plainPassword,
          role: 'customer',
          status: customerStatus,
          loginUrl: '/customer/login'
        });

        // -------------------------------------------------------------
        // STEP B: Contract Provisioning & Sangam CRM Sync
        // -------------------------------------------------------------
        let existingContract = null;
        if (isMongoConnected()) {
          existingContract = await Contract.findOne({
            $or: [
              ...(item.contractId ? [{ contractId: item.contractId }] : []),
              { name: new RegExp(`^${contractName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), company: new RegExp(`^${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            ]
          });
        } else {
          const fileContracts = getContractsFromFile();
          existingContract = fileContracts.find(
            (c) =>
              (item.contractId && c.contractId === item.contractId) ||
              (c.name?.toLowerCase() === contractName.toLowerCase() && c.company?.toLowerCase() === company.toLowerCase())
          );
        }

        const contractCode = existingContract?.contractId || (await nextContractCode());

        const contractPayload = {
          contractId: contractCode,
          name: contractName,
          company,
          customer: contactPerson,
          customerId,
          accountId: sangamAccountId,
          email,
          service,
          contractType,
          subscriptionPeriod: duration,
          productCategory,
          totalContractValue: formattedTotalValue,
          value: `${formattedTotalValue} / ${duration.toLowerCase()}`,
          orderDate,
          startDate,
          endDate,
          expiryDate: endDate,
          status: contractStatus,
          paymentStatus,
          slaTier,
          description,
          salesPerson,
          createdBy: raisedBy
        };

        let savedContract = null;
        if (isMongoConnected()) {
          if (existingContract) {
            savedContract = await Contract.findByIdAndUpdate(
              existingContract._id,
              { $set: { ...contractPayload, updatedBy: raisedBy } },
              { new: true }
            ).lean();
          } else {
            savedContract = (await Contract.create({
              ...contractPayload,
              sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
            })).toObject();
          }
        } else {
          const fileContracts = getContractsFromFile();
          const cIdx = fileContracts.findIndex((c) => c.contractId === contractCode);
          if (cIdx !== -1) {
            fileContracts[cIdx] = { ...fileContracts[cIdx], ...contractPayload, updatedBy: raisedBy, updatedAt: new Date().toISOString() };
            savedContract = fileContracts[cIdx];
          } else {
            savedContract = { ...contractPayload, createdAt: new Date().toISOString(), sangamCrm: { status: 'pending', recordId: null } };
            fileContracts.unshift(savedContract);
          }
          saveContractsToFile(fileContracts);
        }

        // Sync Contract to Sangam CRM Contracts module
        try {
          const crmCtrRes = await sangamCrmService.createOrUpdateContract(savedContract);
          if (crmCtrRes.success) {
            crmSyncCount++;
            if (isMongoConnected()) {
              await Contract.updateOne(
                { contractId: contractCode },
                { $set: { 'sangamCrm.status': 'synced', 'sangamCrm.recordId': crmCtrRes.recordId, 'sangamCrm.lastSyncedAt': new Date() } }
              );
            }
          }
        } catch (ctrSyncErr) {
          console.warn('[MasterImport] CRM contract sync note:', ctrSyncErr.message);
        }

        // -------------------------------------------------------------
        // STEP C: Payment Recording & Receipt Generation (if Paid)
        // -------------------------------------------------------------
        let createdPaymentId = null;
        let createdInvoiceNumber = null;

        if (isPaid) {
          createdPaymentId = await nextLedgerReference('paymentId', `PAY-${year}-`);
          createdInvoiceNumber = await nextLedgerReference('invoiceNumber', `INV-${year}-`);

          const digits = String(formattedTotalValue).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
          const numVal = digits ? Number(digits[0]) : 0;
          const basePrice = numVal > 0 ? Math.round(numVal / 1.18) : 0;
          const gstVal = Math.max(numVal - basePrice, 0);

          const paymentPayload = {
            paymentId: createdPaymentId,
            id: createdPaymentId,
            invoiceNumber: createdInvoiceNumber,
            invoiceRef: createdInvoiceNumber,
            customer: contactPerson,
            company,
            accountName: company,
            email,
            customerId,
            amount: formattedTotalValue,
            receivedAmount: formattedTotalValue,
            pendingPayment: '₹0',
            paymentMethod,
            method: paymentMethod,
            invoiceDate: orderDate || startDate,
            date: orderDate || startDate,
            paymentReceivedDate: orderDate || startDate,
            status: 'Received',
            solutionCategory: service,
            contractId: contractCode,
            contractIds: [contractCode],
            taxableAmount: `₹${basePrice.toLocaleString('en-IN')}`,
            gstAmount: `₹${gstVal.toLocaleString('en-IN')}`,
            gstBasis: 'Imported via Master CSV with standard 18% GST',
            salesPerson,
            referenceNumber,
            bankName,
            source: 'import',
            items: [
              {
                name: service,
                quantity: 1,
                basePrice,
                gstAmount: gstVal,
                finalPrice: numVal,
                durationMonths: duration.includes('Year') ? 12 : parseInt(duration, 10) || 12,
                startDate,
                endDate,
                description: description || service
              }
            ],
            raisedBy,
            createdAt: new Date().toISOString()
          };

          if (isMongoConnected()) {
            await Payment.create(paymentPayload);
          } else {
            const filePayments = getPaymentsFromFile();
            filePayments.unshift(paymentPayload);
            savePaymentsToFile(filePayments);
          }

          paymentsCount++;
          receiptsCount++;
        }

        // -------------------------------------------------------------
        // STEP D: Record Result
        // -------------------------------------------------------------
        touchedIdentities.set(`${email}|${company}|${contactPerson}`, {
          customerId,
          email,
          company,
          customer: contactPerson
        });

        if (isPaid) activeCount++;
        else demoCount++;

        results.push({
          row: i + 1,
          company,
          customer: contactPerson,
          email,
          customerId,
          customerStatus,
          contractId: contractCode,
          contractStatus,
          paymentStatus,
          paymentId: createdPaymentId,
          receiptNumber: createdInvoiceNumber,
          totalValue: formattedTotalValue,
          ok: true
        });
        succeededCount++;
      } catch (rowErr) {
        console.error(`[MasterImport] Error on row ${i + 1}:`, rowErr);
        results.push({
          row: i + 1,
          company: company || 'Unknown',
          customer: contactPerson || 'Unknown',
          ok: false,
          error: rowErr.message || 'Failed to import master record.'
        });
        failedCount++;
      }
    }

    // Refresh Customer Lifecycle for all touched accounts
    for (const identity of touchedIdentities.values()) {
      await refreshCustomerLifecycle(identity).catch((err) =>
        console.warn('[MasterImport] Lifecycle refresh note:', err.message)
      );
    }

    await logNotification({
      type: 'customer_created',
      title: 'Unified Master CSV Import',
      message: `Imported ${succeededCount} master records: ${activeCount} active, ${demoCount} demo trials, ${paymentsCount} payments & receipts generated.`,
      severity: failedCount > 0 ? 'warning' : 'success',
      entityType: 'customer',
      metadata: { total: rows.length, succeeded: succeededCount, failed: failedCount, activeCount, demoCount, paymentsCount, receiptsCount, crmSyncCount }
    });

    await logActivity(req, {
      action: 'IMPORT_MASTER_CSV',
      category: 'customer',
      resource: 'MasterImport',
      details: `Bulk imported ${succeededCount} master records from unified CSV (${activeCount} active, ${demoCount} demo, ${paymentsCount} payments, ${receiptsCount} receipts, ${crmSyncCount} synced to CRM).`,
      changes: { total: rows.length, succeeded: succeededCount, failed: failedCount, activeCount, demoCount, paymentsCount, receiptsCount }
    });

    return res.status(200).json({
      success: true,
      total: rows.length,
      succeeded: succeededCount,
      failed: failedCount,
      activeCount,
      demoCount,
      paymentsCount,
      receiptsCount,
      crmSyncCount,
      credentials,
      results
    });
  } catch (err) {
    console.error('[CustomerController] importMaster error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to import master CSV records.' });
  }
};

