import mongoose from 'mongoose';
import Product, { getProductsFromFile, saveProductsToFile } from '../models/Product.js';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Custom plans are quoted per concurrent user, so the catalog price is derived
// here instead of trusting the request body.
const deriveCustomPlan = (payload) => {
  if (payload.isCustomPlan !== true) return {};

  const users = Math.floor(Number(payload.users));
  const pricePerUser = Number(payload.pricePerUser);

  if (!Number.isFinite(users) || users < 1) {
    return { error: 'A custom plan needs a user count of at least 1.' };
  }
  if (!Number.isFinite(pricePerUser) || pricePerUser <= 0) {
    return { error: 'A custom plan needs a per-user monthly price above ₹0.' };
  }

  const dedicated = payload.serverType === 'dedicated';
  const monthlyBase = Math.round(users * pricePerUser);

  const targetEmail = String(payload.targetCustomerEmail || payload.customerEmail || '').trim().toLowerCase();
  const targetId = String(payload.targetCustomerId || payload.customerId || '').trim();
  const targetName = String(payload.targetCustomerName || payload.customerName || '').trim();
  const isCustomerSpecific = Boolean(payload.isCustomerSpecific || targetEmail || targetId);

  return {
    fields: {
      users,
      pricePerUser,
      monthlyPrice: monthlyBase,
      price: `₹${monthlyBase.toLocaleString('en-IN')}`,
      frequency: '/ month',
      tier: payload.tier || `${users} User`,
      serverType: dedicated ? 'dedicated' : 'shared',
      userBadge: dedicated ? 'Dedicated Server' : 'Shared Server',
      isCustomerSpecific,
      targetCustomerEmail: targetEmail,
      targetCustomerId: targetId,
      targetCustomerName: targetName
    }
  };
};

// Demo plans are time-boxed trials, so the duration is required and a ₹0 price
// is published as FREE rather than a monthly rate.
const deriveDemoPlan = (payload) => {
  if (payload.isDemoPlan !== true) return {};

  const duration = String(payload.duration || '').trim();
  const amount = Number(payload.priceAmount);

  if (!duration) {
    return { error: 'A demo plan needs a duration (e.g. 1 Week).' };
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: 'A demo plan price must be ₹0 or more.' };
  }

  return {
    fields: {
      duration,
      users: 1,
      monthlyPrice: amount,
      price: amount === 0 ? 'FREE' : `₹${amount.toLocaleString('en-IN')}`,
      frequency: '',
      category: 'Trial',
      provider: 'demo',
      tier: '',
      userBadge: '',
      serverType: '',
      pricePerUser: 0,
      isCustomPlan: false,
      isCustomerSpecific: false,
      targetCustomerEmail: '',
      targetCustomerId: '',
      targetCustomerName: ''
    }
  };
};

const planFields = (payload) =>
  payload.isDemoPlan === true ? deriveDemoPlan(payload) : deriveCustomPlan(payload);

export const getProducts = async (req, res) => {
  try {
    const { category, provider, status, available, customerEmail, customerId } = req.query;

    const filter = {};
    if (category && category !== 'all') {
      filter.category = new RegExp(category, 'i');
    }
    if (provider && provider !== 'all') {
      filter.provider = provider;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (available !== undefined && available !== '') {
      filter.available = available === 'true';
    }

    let products = [];
    if (isMongoConnected()) {
      products = await Product.find(filter).sort({ users: 1, createdAt: -1 }).lean();
    } else {
      products = getProductsFromFile();
    }

    // Role and caller identification
    const userRole = req.user?.role;
    const isAdmin = Boolean(
      userRole === 'admin' ||
      userRole === 'manager' ||
      userRole === 'support' ||
      req.user?.isPrimaryAdmin
    );

    // Identify requesting customer email/ID either from authenticated user session or query params
    const activeCustomerEmail = String(
      (req.user && req.user.role === 'customer' ? req.user.email : null) ||
      customerEmail ||
      ''
    ).trim().toLowerCase();

    const activeCustomerId = String(
      (req.user && req.user.role === 'customer' ? req.user.customerId : null) ||
      customerId ||
      ''
    ).trim().toLowerCase();

    // If request is from an admin without customer-specific query, return all plans so admin can manage them
    // If request is from a customer (or scoped to a customer), filter out other customers' private custom plans
    let scopedProducts = products;
    if (!isAdmin || activeCustomerEmail || activeCustomerId) {
      scopedProducts = products.filter((p) => {
        // Non-custom plans and demo plans are general
        if (!p.isCustomPlan) return true;

        // Generic custom plans not tied to any customer
        if (!p.isCustomerSpecific && !p.targetCustomerEmail && !p.targetCustomerId) {
          return true;
        }

        // Customer-specific custom plan: only visible if matched!
        const planTargetEmail = String(p.targetCustomerEmail || '').trim().toLowerCase();
        const planTargetId = String(p.targetCustomerId || '').trim().toLowerCase();

        if (activeCustomerEmail && planTargetEmail && planTargetEmail === activeCustomerEmail) {
          return true;
        }
        if (activeCustomerId && planTargetId && planTargetId === activeCustomerId) {
          return true;
        }

        // If no match, hide this custom plan from this customer
        return false;
      });
    }

    const visible = redactRecords(req.user, 'product', scopedProducts);
    res.json({
      success: true,
      count: visible.length,
      data: visible
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const payload = req.body;
    const derived = planFields(payload);
    if (derived.error) {
      return res.status(400).json({ success: false, error: derived.error });
    }

    const productId = payload.productId || payload.id || `PROD-${Date.now()}`;
    const newProductData = {
      ...payload,
      ...derived.fields,
      productId,
      id: productId,
      sku: payload.sku || productId,
      ipAddress: payload.ipAddress === undefined ? '103.115.220.44' : payload.ipAddress,
      available: payload.available !== false,
      status: payload.available === false ? 'inactive' : 'active'
    };

    let saved = newProductData;
    if (isMongoConnected()) {
      saved = await Product.create(newProductData);
    } else {
      const list = getProductsFromFile();
      list.unshift(newProductData);
      saveProductsToFile(list);
    }

    const ipNote = newProductData.ipAddress ? ` with IP ${newProductData.ipAddress}` : '';

    await logActivity(req, {
      action: 'PRODUCT_CREATED',
      category: 'product',
      resource: 'Product',
      resourceId: productId,
      details: `Product ${newProductData.name} (${newProductData.category}) created${ipNote}`
    });

    await logNotification({
      type: 'product_created',
      title: 'Product Added to Catalog',
      message: `${newProductData.name} added to catalog${ipNote}.`,
      severity: 'info',
      entityType: 'product',
      entityId: productId,
      metadata: newProductData
    });

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const derived = planFields(req.body);
    if (derived.error) {
      return res.status(400).json({ success: false, error: derived.error });
    }
    const updates = { ...req.body, ...derived.fields };

    if (updates.available !== undefined) {
      updates.status = updates.available ? 'active' : 'inactive';
    } else if (updates.status !== undefined) {
      updates.available = updates.status === 'active';
    }

    let updated = null;
    if (isMongoConnected()) {
      updated = await Product.findOneAndUpdate(
        { $or: [{ productId: id }, { id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        updates,
        { new: true }
      ).lean();
    } else {
      const list = getProductsFromFile();
      const idx = list.findIndex((p) => p.productId === id || p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveProductsToFile(list);
        updated = list[idx];
      }
    }

    await logActivity(req, {
      action: 'PRODUCT_UPDATED',
      category: 'product',
      resource: 'Product',
      resourceId: id,
      details: `Product ${id} updated: ${updates.available !== undefined ? (updates.available ? 'Activated' : 'Deactivated') : 'Details modified'}`
    });

    res.json({
      success: true,
      data: updated || updates
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Product.findOneAndDelete({
        $or: [{ productId: id }, { id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
    } else {
      const list = getProductsFromFile();
      const filtered = list.filter((p) => p.productId !== id && p.id !== id);
      saveProductsToFile(filtered);
    }

    await logActivity(req, {
      action: 'PRODUCT_DELETED',
      category: 'product',
      resource: 'Product',
      resourceId: id,
      details: `Product ${id} removed from catalog.`
    });

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

