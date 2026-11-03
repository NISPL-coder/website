import mongoose from 'mongoose';
import Product, { getProductsFromFile, saveProductsToFile } from '../models/Product.js';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getProducts = async (req, res) => {
  try {
    const { category, provider, status, available } = req.query;

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
    }

    if (!products || products.length === 0) {
      let list = getProductsFromFile();
      if (category && category !== 'all') {
        list = list.filter((p) => p.category?.toLowerCase().includes(category.toLowerCase()));
      }
      if (provider && provider !== 'all') {
        list = list.filter((p) => p.provider === provider);
      }
      if (status && status !== 'all') {
        list = list.filter((p) => p.status === status);
      }
      if (available !== undefined && available !== '') {
        const isAvail = available === 'true';
        list = list.filter((p) => p.available === isAvail);
      }
      products = list;
    }

    const visible = redactRecords(req.user, 'product', products);
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
    const productId = payload.productId || payload.id || `PROD-${Date.now()}`;
    const newProductData = {
      ...payload,
      productId,
      id: productId,
      sku: payload.sku || productId,
      ipAddress: payload.ipAddress || '103.115.220.44',
      available: payload.available !== false,
      status: payload.available === false ? 'inactive' : 'active'
    };

    let saved = newProductData;
    if (isMongoConnected()) {
      saved = await Product.create(newProductData);
    }

    const list = getProductsFromFile();
    saveProductsToFile([newProductData, ...list]);

    await logActivity(req, {
      action: 'PRODUCT_CREATED',
      category: 'product',
      resource: 'Product',
      resourceId: productId,
      details: `Product ${newProductData.name} (${newProductData.category}) created with IP ${newProductData.ipAddress}`
    });

    await logNotification({
      type: 'product_created',
      title: 'Product Added to Catalog',
      message: `${newProductData.name} added to catalog with IP ${newProductData.ipAddress}.`,
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
    const updates = req.body;

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
    }

    const list = getProductsFromFile();
    const updatedList = list.map((p) =>
      p.productId === id || p.id === id ? { ...p, ...updates } : p
    );
    saveProductsToFile(updatedList);

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
    }

    const list = getProductsFromFile();
    const updatedList = list.filter((p) => p.productId !== id && p.id !== id);
    saveProductsToFile(updatedList);

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

