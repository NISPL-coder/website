import mongoose from 'mongoose';
import { IpRecord, getIpsFromFile, saveIpsToFile } from '../models/IpRecord.js';
import { HttpError } from '../utils/httpError.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const normalizeStatus = (val) => {
  if (!val) return 'Active';
  const s = String(val).trim().toUpperCase();
  if (s === 'INACTIVE') return 'Inactive';
  return 'Active';
};

const normalizeServer = (val) => {
  if (!val) return 'Dedicated';
  const s = String(val).trim().toUpperCase();
  if (s.includes('SHERE') || s.includes('SHARE')) return 'Shared';
  return 'Dedicated';
};

/**
 * GET /api/ip-monitor
 */
export async function getIps(req, res, next) {
  try {
    let records = [];
    if (isMongoConnected()) {
      records = await IpRecord.find().sort({ createdAt: -1 }).lean();
    } else {
      records = getIpsFromFile();
      records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    const formatted = records.map((r) => ({
      id: r._id ? String(r._id) : (r.id || `ip-${Date.now()}`),
      wanIp: r.wanIp || '',
      lanIp: r.lanIp || '',
      rdpPort: String(r.rdpPort || '3389'),
      httpPort: String(r.httpPort || '80'),
      vmId: r.vmId || '',
      status: normalizeStatus(r.status),
      serverType: normalizeServer(r.serverType),
      notes: r.notes || '',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ip-monitor
 */
export async function createIp(req, res, next) {
  try {
    const { wanIp, lanIp, rdpPort, httpPort, vmId, status, serverType, notes } = req.body;

    if (!wanIp || !wanIp.trim()) {
      throw new HttpError(400, 'WAN IP is required.');
    }
    if (!lanIp || !lanIp.trim()) {
      throw new HttpError(400, 'LAN IP is required.');
    }
    if (!vmId || !vmId.trim()) {
      throw new HttpError(400, 'VM ID is required.');
    }

    const recordData = {
      wanIp: wanIp.trim(),
      lanIp: lanIp.trim(),
      rdpPort: String(rdpPort || '3389').trim(),
      httpPort: String(httpPort || '80').trim(),
      vmId: vmId.trim(),
      status: normalizeStatus(status),
      serverType: normalizeServer(serverType),
      notes: (notes || '').trim()
    };

    let createdRecord;
    if (isMongoConnected()) {
      const doc = await IpRecord.create(recordData);
      createdRecord = doc.toObject();
    } else {
      const all = getIpsFromFile();
      const newEntry = {
        id: `IP-${Date.now()}`,
        ...recordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      all.unshift(newEntry);
      saveIpsToFile(all);
      createdRecord = newEntry;
    }

    res.status(201).json({
      success: true,
      message: 'IP record created successfully.',
      data: {
        id: createdRecord._id ? String(createdRecord._id) : (createdRecord.id || ''),
        ...recordData,
        createdAt: createdRecord.createdAt || new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/ip-monitor/:id
 */
export async function updateIp(req, res, next) {
  try {
    const { id } = req.params;
    const { wanIp, lanIp, rdpPort, httpPort, vmId, status, serverType, notes } = req.body;

    const updates = {};
    if (wanIp !== undefined) updates.wanIp = wanIp.trim();
    if (lanIp !== undefined) updates.lanIp = lanIp.trim();
    if (rdpPort !== undefined) updates.rdpPort = String(rdpPort).trim();
    if (httpPort !== undefined) updates.httpPort = String(httpPort).trim();
    if (vmId !== undefined) updates.vmId = vmId.trim();
    if (status !== undefined) updates.status = normalizeStatus(status);
    if (serverType !== undefined) updates.serverType = normalizeServer(serverType);
    if (notes !== undefined) updates.notes = notes.trim();
    updates.updatedAt = new Date().toISOString();

    let updatedRecord;
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      updatedRecord = await IpRecord.findByIdAndUpdate(id, updates, { new: true }).lean();
    } else {
      const all = getIpsFromFile();
      const idx = all.findIndex((r) => String(r.id) === String(id) || String(r._id) === String(id));
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        saveIpsToFile(all);
        updatedRecord = all[idx];
      }
    }

    if (!updatedRecord) {
      throw new HttpError(404, 'IP record not found.');
    }

    res.json({
      success: true,
      message: 'IP record updated successfully.',
      data: {
        id: updatedRecord._id ? String(updatedRecord._id) : (updatedRecord.id || id),
        ...updatedRecord
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ip-monitor/:id
 */
export async function deleteIp(req, res, next) {
  try {
    const { id } = req.params;

    let deleted = false;
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await IpRecord.findByIdAndDelete(id);
      deleted = Boolean(doc);
    } else {
      const all = getIpsFromFile();
      const filtered = all.filter((r) => String(r.id) !== String(id) && String(r._id) !== String(id));
      if (filtered.length !== all.length) {
        saveIpsToFile(filtered);
        deleted = true;
      }
    }

    if (!deleted) {
      throw new HttpError(404, 'IP record not found.');
    }

    res.json({
      success: true,
      message: 'IP record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

