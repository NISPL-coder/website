import mongoose from 'mongoose';
import SecurityEvent from '../models/SecurityEvent.js';
import { isTurnstileEnabled, getTurnstileSiteKey } from '../utils/turnstile.js';

export const getSecurityEvents = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        events: [],
        total: 0,
        summary: {
          totalEvents: 0,
          blockedCount: 0,
          criticalHighCount: 0,
          uniqueIps: 0,
          topEventTypes: [],
          topCountries: []
        }
      });
    }

    const {
      search = '',
      eventType = '',
      riskLevel = '',
      cloudflareAction = '',
      country = '',
      from = '',
      to = '',
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};
    if (eventType && eventType !== 'all') filter.eventType = eventType;
    if (riskLevel && riskLevel !== 'all') filter.riskLevel = riskLevel;
    if (cloudflareAction && cloudflareAction !== 'all') filter.cloudflareAction = cloudflareAction;
    if (country && country !== 'all') filter.country = country.toUpperCase();

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) filter.timestamp.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    if (search && String(search).trim()) {
      const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { ipAddress: rx },
        { country: rx },
        { requestUrl: rx },
        { userAgent: rx },
        { identifier: rx },
        { details: rx }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [events, total, blockedCount, criticalHighCount, uniqueIpsList, topEventTypes, topCountries] =
      await Promise.all([
        SecurityEvent.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
        SecurityEvent.countDocuments(filter),
        SecurityEvent.countDocuments({ ...filter, cloudflareAction: 'block' }),
        SecurityEvent.countDocuments({ ...filter, riskLevel: { $in: ['High', 'Critical'] } }),
        SecurityEvent.distinct('ipAddress', filter),
        SecurityEvent.aggregate([
          { $match: filter },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        SecurityEvent.aggregate([
          { $match: filter },
          { $group: { _id: '$country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

    res.json({
      success: true,
      events,
      total,
      page: pageNum,
      limit: limitNum,
      summary: {
        totalEvents: total,
        blockedCount,
        criticalHighCount,
        uniqueIps: uniqueIpsList.length,
        topEventTypes: topEventTypes.map((r) => ({ type: r._id, count: r.count })),
        topCountries: topCountries.map((r) => ({ country: r._id || 'Unknown', count: r.count }))
      }
    });
  } catch (err) {
    console.error('[SecurityController] Error fetching security events:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSecurityStatus = async (req, res) => {
  res.json({
    success: true,
    status: {
      trustProxy: true,
      cloudflareStrictOrigin: process.env.CLOUDFLARE_STRICT_ORIGIN === 'true',
      turnstileEnabled: isTurnstileEnabled(),
      turnstileSiteKey: getTurnstileSiteKey(),
      rateLimits: {
        adminLogin: '5 failed attempts / 15 min',
        customerLogin: '10 failed attempts / 15 min',
        otpVerification: '5 attempts / 10 min',
        passwordReset: '3 requests / 15 min'
      }
    }
  });
};
