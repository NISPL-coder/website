import mongoose from 'mongoose';
import {
  Addon,
  AddonSetting,
  INITIAL_ADDONS,
  getAddonsFromFile,
  saveAddonsToFile,
  getAddonSettingsFromFile,
  saveAddonSettingsToFile
} from '../models/Addon.js';
import { HttpError } from '../utils/httpError.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Ensure initial seed data exists in DB or JSON file
 */
async function ensureAddonsSeeded() {
  if (isMongoConnected()) {
    const count = await Addon.countDocuments();
    if (count === 0) {
      await Addon.insertMany(INITIAL_ADDONS);
      saveAddonsToFile(INITIAL_ADDONS);
    }
    const settingCount = await AddonSetting.countDocuments();
    if (settingCount === 0) {
      await AddonSetting.create({ key: 'checkout_config', showAddonsOnCheckout: true });
      saveAddonSettingsToFile({ showAddonsOnCheckout: true });
    }
  }
}

/**
 * GET /api/v1/addons
 * Public & Customer facing endpoint
 */
export async function getAddons(req, res) {
  try {
    await ensureAddonsSeeded();
    let showAddonsOnCheckout = true;
    let addons = [];

    if (isMongoConnected()) {
      const setting = await AddonSetting.findOne({ key: 'checkout_config' }).lean();
      if (setting && typeof setting.showAddonsOnCheckout === 'boolean') {
        showAddonsOnCheckout = setting.showAddonsOnCheckout;
      }
      addons = await Addon.find().sort({ order: 1, createdAt: 1 }).lean();
    } else {
      const settings = getAddonSettingsFromFile();
      showAddonsOnCheckout = settings.showAddonsOnCheckout ?? true;
      addons = getAddonsFromFile();
    }

    // Map basePrice for compatibility with Cart
    const normalized = addons.map((a) => ({
      ...a,
      basePrice: a.amount || a.basePrice || 0
    }));

    res.json({
      success: true,
      data: {
        showAddonsOnCheckout,
        addons: normalized
      }
    });
  } catch (err) {
    console.error('[AddonController.getAddons] Error:', err);
    const settings = getAddonSettingsFromFile();
    const fallbackList = getAddonsFromFile().map((a) => ({
      ...a,
      basePrice: a.amount || a.basePrice || 0
    }));

    res.json({
      success: true,
      data: {
        showAddonsOnCheckout: settings.showAddonsOnCheckout ?? true,
        addons: fallbackList
      }
    });
  }
}

/**
 * GET /api/v1/addons/admin/all
 * Admin listing of all addons with config
 */
export async function getAdminAddons(req, res) {
  try {
    await ensureAddonsSeeded();
    let showAddonsOnCheckout = true;
    let addons = [];

    if (isMongoConnected()) {
      const setting = await AddonSetting.findOne({ key: 'checkout_config' }).lean();
      if (setting && typeof setting.showAddonsOnCheckout === 'boolean') {
        showAddonsOnCheckout = setting.showAddonsOnCheckout;
      }
      addons = await Addon.find().sort({ order: 1, createdAt: 1 }).lean();
    } else {
      const settings = getAddonSettingsFromFile();
      showAddonsOnCheckout = settings.showAddonsOnCheckout ?? true;
      addons = getAddonsFromFile();
    }

    const normalized = addons.map((a) => ({
      ...a,
      basePrice: a.amount || a.basePrice || 0
    }));

    res.json({
      success: true,
      data: {
        showAddonsOnCheckout,
        addons: normalized
      }
    });
  } catch (err) {
    console.error('[AddonController.getAdminAddons] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve add-ons.' });
  }
}

/**
 * POST /api/v1/addons
 * Create a new Add-on product
 */
export async function createAddon(req, res) {
  try {
    const {
      name,
      category = 'General Add-on',
      badge = 'ADD-ON',
      badgeColor = '#059669',
      badgeBg = '#ecfdf5',
      amount = 0,
      billingCycle = 'Annual',
      desc = '',
      spec = '',
      image = '',
      available = true
    } = req.body;

    if (!name || !String(name).trim()) {
      throw new HttpError(400, 'Add-on name is required.');
    }

    const numAmount = Math.max(Number(amount) || 0, 0);
    const newId = `addon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const addonData = {
      id: newId,
      name: String(name).trim(),
      category: String(category || 'General Add-on').trim(),
      badge: String(badge || 'ADD-ON').trim(),
      badgeColor: badgeColor || '#059669',
      badgeBg: badgeBg || '#ecfdf5',
      amount: numAmount,
      billingCycle: String(billingCycle || 'Annual').trim(),
      desc: String(desc || '').trim(),
      spec: String(spec || '').trim(),
      image: String(image || '').trim(),
      available: Boolean(available),
      order: Date.now()
    };

    let saved = null;
    if (isMongoConnected()) {
      saved = await Addon.create(addonData);
    } else {
      saved = addonData;
    }

    // Sync to file
    const all = getAddonsFromFile();
    all.push(saved.toObject ? saved.toObject() : saved);
    saveAddonsToFile(all);

    res.status(201).json({
      success: true,
      message: 'Add-on product created successfully.',
      addon: {
        ...(saved.toObject ? saved.toObject() : saved),
        basePrice: numAmount
      }
    });
  } catch (err) {
    console.error('[AddonController.createAddon] Error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to create add-on product.'
    });
  }
}

/**
 * PUT /api/v1/addons/:id
 * Update an existing Add-on product
 */
export async function updateAddon(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    if (updates.amount !== undefined) {
      updates.amount = Math.max(Number(updates.amount) || 0, 0);
    }

    let updated = null;
    if (isMongoConnected()) {
      updated = await Addon.findOneAndUpdate(
        { $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        { $set: updates },
        { new: true }
      ).lean();
    }

    // Sync file
    const all = getAddonsFromFile();
    const index = all.findIndex((a) => a.id === id || a._id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      saveAddonsToFile(all);
      if (!updated) updated = all[index];
    }

    if (!updated) {
      throw new HttpError(404, 'Add-on product not found.');
    }

    res.json({
      success: true,
      message: 'Add-on product updated successfully.',
      addon: {
        ...updated,
        basePrice: updated.amount || 0
      }
    });
  } catch (err) {
    console.error('[AddonController.updateAddon] Error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update add-on product.'
    });
  }
}

/**
 * PATCH /api/v1/addons/:id/toggle
 * Toggle availability of a specific add-on
 */
export async function toggleAddon(req, res) {
  try {
    const { id } = req.params;
    const { available } = req.body || {};

    let targetAvailable = available;

    let updated = null;
    if (isMongoConnected()) {
      const current = await Addon.findOne({
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
      if (current) {
        if (targetAvailable === undefined) {
          targetAvailable = !current.available;
        }
        current.available = targetAvailable;
        await current.save();
        updated = current.toObject();
      }
    }

    // Sync file
    const all = getAddonsFromFile();
    const index = all.findIndex((a) => a.id === id || a._id === id);
    if (index !== -1) {
      if (targetAvailable === undefined) {
        targetAvailable = !all[index].available;
      }
      all[index].available = targetAvailable;
      saveAddonsToFile(all);
      if (!updated) updated = all[index];
    }

    if (!updated) {
      throw new HttpError(404, 'Add-on product not found.');
    }

    res.json({
      success: true,
      message: `Add-on product is now ${targetAvailable ? 'Available' : 'Disabled'}.`,
      addon: updated
    });
  } catch (err) {
    console.error('[AddonController.toggleAddon] Error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to toggle add-on availability.'
    });
  }
}

/**
 * PATCH /api/v1/addons/toggle-checkout
 * Toggle master visibility switch: whether Add-ons show on customer checkout page
 */
export async function toggleCheckoutAddons(req, res) {
  try {
    const { showAddonsOnCheckout } = req.body || {};

    let nextValue = showAddonsOnCheckout;

    if (isMongoConnected()) {
      let setting = await AddonSetting.findOne({ key: 'checkout_config' });
      if (!setting) {
        setting = new AddonSetting({ key: 'checkout_config', showAddonsOnCheckout: true });
      }
      if (nextValue === undefined) {
        nextValue = !setting.showAddonsOnCheckout;
      }
      setting.showAddonsOnCheckout = Boolean(nextValue);
      await setting.save();
    } else {
      const current = getAddonSettingsFromFile();
      if (nextValue === undefined) {
        nextValue = !current.showAddonsOnCheckout;
      }
    }

    saveAddonSettingsToFile({ showAddonsOnCheckout: Boolean(nextValue) });

    res.json({
      success: true,
      message: Boolean(nextValue)
        ? 'Add-ons section is now VISIBLE on customer checkout.'
        : 'Add-ons section is now HIDDEN from customer checkout.',
      showAddonsOnCheckout: Boolean(nextValue)
    });
  } catch (err) {
    console.error('[AddonController.toggleCheckoutAddons] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update checkout add-ons visibility toggle.'
    });
  }
}

/**
 * DELETE /api/v1/addons/:id
 * Remove an Add-on product
 */
export async function deleteAddon(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Addon.deleteOne({
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
    }

    const all = getAddonsFromFile().filter((a) => a.id !== id && a._id !== id);
    saveAddonsToFile(all);

    res.json({
      success: true,
      message: 'Add-on product removed from catalog.'
    });
  } catch (err) {
    console.error('[AddonController.deleteAddon] Error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to delete add-on product.'
    });
  }
}

