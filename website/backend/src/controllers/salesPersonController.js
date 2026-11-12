import mongoose from 'mongoose';
import SalesPerson, { getSalesPersonsFromFile, saveSalesPersonsToFile } from '../models/SalesPerson.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * GET /api/v1/sales-persons
 * Returns list of all sales persons with summary statistics
 */
export const getSalesPersons = async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      list = await SalesPerson.find().sort({ createdAt: -1 }).lean();
    } else {
      list = getSalesPersonsFromFile();
    }

    const formatted = list.map((sp) => ({
      ...sp,
      id: sp.salesPersonId || sp._id || sp.id
    }));

    const statusFilter = req.query.status;
    let filtered = formatted;
    if (statusFilter && statusFilter !== 'all') {
      filtered = formatted.filter(
        (sp) => String(sp.status || '').toLowerCase() === String(statusFilter).toLowerCase()
      );
    }

    const total = formatted.length;
    const active = formatted.filter((sp) => String(sp.status).toLowerCase() === 'active').length;
    const inactive = total - active;

    return res.status(200).json({
      success: true,
      count: filtered.length,
      stats: {
        total,
        active,
        inactive
      },
      data: filtered
    });
  } catch (error) {
    console.error('[salesPersonController] getSalesPersons error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sales persons',
      count: 0,
      stats: { total: 0, active: 0, inactive: 0 },
      data: []
    });
  }
};

/**
 * GET /api/v1/sales-persons/active
 * Fast endpoint for customer portal and drop-downs (only returns active representatives)
 */
export const getActiveSalesPersons = async (_req, res) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      list = await SalesPerson.find({ status: 'Active' }).sort({ name: 1 }).lean();
    } else {
      list = getSalesPersonsFromFile().filter((sp) => sp.status === 'Active');
    }

    const data = list.map((sp) => ({
      id: sp.salesPersonId || sp._id || sp.id,
      name: sp.name,
      email: sp.email || '',
      phone: sp.phone || '',
      designation: sp.designation || 'Sales Executive'
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('[salesPersonController] getActiveSalesPersons error:', error);
    return res.status(500).json({
      success: false,
      count: 0,
      data: []
    });
  }
};

/**
 * POST /api/v1/sales-persons
 * Create a new sales person
 */
export const createSalesPerson = async (req, res) => {
  try {
    const { name, email, phone, designation, status, notes, assignedCustomers } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sales Person name is required'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const cleanDesignation = (designation || 'Sales Executive').trim();
    const cleanStatus = status === 'Inactive' ? 'Inactive' : 'Active';
    const cleanNotes = (notes || '').trim();
    const cleanCustomers = Array.isArray(assignedCustomers) ? assignedCustomers : [];

    const newId = `SP-${Math.floor(100 + Math.random() * 900)}`;

    let saved = null;
    if (isMongoConnected()) {
      // Check for duplicate name
      const existing = await SalesPerson.findOne({
        name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Sales person "${cleanName}" already exists`
        });
      }

      saved = await SalesPerson.create({
        salesPersonId: newId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        designation: cleanDesignation,
        status: cleanStatus,
        notes: cleanNotes,
        assignedCustomers: cleanCustomers
      });
    }

    // Always update file store for offline/sync consistency
    const fileList = getSalesPersonsFromFile();
    const record = {
      id: saved?.salesPersonId || newId,
      salesPersonId: saved?.salesPersonId || newId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      designation: cleanDesignation,
      status: cleanStatus,
      notes: cleanNotes,
      assignedCustomers: cleanCustomers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fileList.unshift(record);
    saveSalesPersonsToFile(fileList);

    return res.status(201).json({
      success: true,
      message: 'Sales person created successfully',
      data: saved ? { ...saved.toObject(), id: saved.salesPersonId || saved._id } : record
    });
  } catch (error) {
    console.error('[salesPersonController] createSalesPerson error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create sales person'
    });
  }
};

/**
 * PUT /api/v1/sales-persons/:id
 * Update an existing sales person
 */
export const updateSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, designation, status, notes, assignedCustomers } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (designation !== undefined) updates.designation = designation.trim();
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes.trim();
    if (assignedCustomers !== undefined) updates.assignedCustomers = Array.isArray(assignedCustomers) ? assignedCustomers : [];

    let updated = null;
    if (isMongoConnected()) {
      const orConditions = [{ salesPersonId: id }, { id: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: id });
      }

      updated = await SalesPerson.findOneAndUpdate({ $or: orConditions }, { $set: updates }, { new: true });
    }

    // Sync to file store
    const fileList = getSalesPersonsFromFile();
    let fileFound = false;
    const updatedList = fileList.map((sp) => {
      if (sp.id === id || sp.salesPersonId === id || String(sp._id) === id) {
        fileFound = true;
        return {
          ...sp,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return sp;
    });

    if (fileFound) {
      saveSalesPersonsToFile(updatedList);
    }

    if (!updated && !fileFound) {
      return res.status(404).json({
        success: false,
        message: 'Sales person not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sales person updated successfully',
      data: updated ? { ...updated.toObject(), id: updated.salesPersonId || updated._id } : updatedList.find(s => s.id === id || s.salesPersonId === id)
    });
  } catch (error) {
    console.error('[salesPersonController] updateSalesPerson error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update sales person'
    });
  }
};

/**
 * DELETE /api/v1/sales-persons/:id
 * Delete a sales person
 */
export const deleteSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const orConditions = [{ salesPersonId: id }, { id: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: id });
      }
      await SalesPerson.deleteMany({ $or: orConditions });
    }

    // Sync to file store
    const fileList = getSalesPersonsFromFile();
    const filtered = fileList.filter((sp) => sp.id !== id && sp.salesPersonId !== id && String(sp._id) !== id);
    saveSalesPersonsToFile(filtered);

    return res.status(200).json({
      success: true,
      message: 'Sales person deleted successfully'
    });
  } catch (error) {
    console.error('[salesPersonController] deleteSalesPerson error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete sales person'
    });
  }
};

