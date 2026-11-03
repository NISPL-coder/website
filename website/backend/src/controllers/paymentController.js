import Payment, { getPaymentsFromFile, savePaymentsToFile } from '../models/Payment.js';
import mongoose from 'mongoose';
import { logActivity } from '../utils/activityLogger.js';
import { logNotification } from '../services/notificationService.js';
import { redactRecords } from '../utils/columnPermissions.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getPayments = async (req, res) => {
  try {
    let payments = [];
    if (isMongoConnected()) {
      payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
    }
    if (!payments || payments.length === 0) {
      payments = getPaymentsFromFile();
    }

    const visible = redactRecords(req.user, 'payment', payments);
    res.json({
      success: true,
      count: visible.length,
      data: visible
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payload = req.body;
    const paymentId = payload.paymentId || payload.id || `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPaymentData = {
      ...payload,
      paymentId,
      id: paymentId,
      accountName: payload.accountName || payload.company,
      invoiceRef: payload.invoiceRef || payload.invoiceNumber,
      date: payload.date || payload.invoiceDate || new Date().toISOString().split('T')[0],
      method: payload.method || payload.paymentMethod || 'NEFT Wire'
    };

    let savedPayment = newPaymentData;
    if (isMongoConnected()) {
      savedPayment = await Payment.create(newPaymentData);
    }

    // Update fallback file
    const list = getPaymentsFromFile();
    savePaymentsToFile([newPaymentData, ...list]);

    await logActivity(req, {
      action: 'PAYMENT_RECORDED',
      category: 'payment',
      resource: 'Payment',
      resourceId: paymentId,
      details: `Payment ${paymentId} recorded for ${newPaymentData.company} (${newPaymentData.amount})`
    });

    if (newPaymentData.status === 'Received' || newPaymentData.status === 'Cleared') {
      await logNotification({
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ${newPaymentData.amount} received from ${newPaymentData.company} via ${newPaymentData.method}.`,
        severity: 'success',
        entityType: 'payment',
        entityId: paymentId,
        user: { name: newPaymentData.customer, company: newPaymentData.company },
        metadata: newPaymentData
      });
    }

    res.status(201).json({
      success: true,
      data: savedPayment
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated = null;
    if (isMongoConnected()) {
      updated = await Payment.findOneAndUpdate(
        { $or: [{ paymentId: id }, { id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        updates,
        { new: true }
      ).lean();
    }

    const list = getPaymentsFromFile();
    const updatedList = list.map((p) => (p.paymentId === id || p.id === id ? { ...p, ...updates } : p));
    savePaymentsToFile(updatedList);

    res.json({
      success: true,
      data: updated || updates
    });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Payment.findOneAndDelete({
        $or: [{ paymentId: id }, { id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
    }

    const list = getPaymentsFromFile();
    const updatedList = list.filter((p) => p.paymentId !== id && p.id !== id);
    savePaymentsToFile(updatedList);

    res.json({
      success: true,
      message: 'Payment deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export default {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
};
