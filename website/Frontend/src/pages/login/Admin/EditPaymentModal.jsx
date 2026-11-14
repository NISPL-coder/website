import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '../../../services/paymentApi';
import { notificationApi } from '../../../services/notificationApi';

const PAYMENT_METHODS = [
  'NEFT / RTGS',
  'Cheque',
  'UPI / QR Code',
  'Bank Transfer',
  'Credit / Debit Card',
  'Razorpay Gateway',
  'Cash',
  'Demand Draft',
  'Other'
];

const PAYMENT_STATUSES = ['Received', 'Cleared', 'Pending', 'Overdue'];

export default function EditPaymentModal({ payment, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    company: '',
    customer: '',
    email: '',
    productName: '',
    amount: '',
    receivedAmount: '',
    pendingPayment: '₹0',
    taxableAmount: '',
    gstAmount: '',
    paymentMethod: 'NEFT / RTGS',
    referenceNumber: '',
    bankName: '',
    paymentReceivedDate: '',
    depositDate: '',
    salesPerson: '',
    status: 'Received',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        invoiceNumber: payment.invoiceNumber || payment.invoiceRef || '',
        invoiceDate: payment.invoiceDate || payment.date || '',
        company: payment.company || payment.accountName || '',
        customer: payment.customer || '',
        email: payment.email || '',
        productName: payment.solutionCategory || payment.service || (payment.items && payment.items[0]?.name) || '',
        amount: payment.amount || payment.receivedAmount || '',
        receivedAmount: payment.receivedAmount || payment.amount || '',
        pendingPayment: payment.pendingPayment || '₹0',
        taxableAmount: payment.taxableAmount || (payment.baseAmount ? `₹${Number(payment.baseAmount).toLocaleString('en-IN')}` : ''),
        gstAmount: payment.gstAmount || (payment.taxAmount ? `₹${Number(payment.taxAmount).toLocaleString('en-IN')}` : ''),
        paymentMethod: payment.paymentMethod || payment.paymentMode || payment.method || 'NEFT / RTGS',
        referenceNumber: payment.referenceNumber || payment.chequeNumber || payment.refNo || '',
        bankName: payment.bankName || payment.bankBranch || '',
        paymentReceivedDate: payment.paymentReceivedDate || payment.date || '',
        depositDate: payment.depositDate || '',
        salesPerson: payment.salesPerson || '',
        status: payment.status || 'Received',
        notes: payment.notes || ''
      });
    }
  }, [payment]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() && !formData.customer.trim()) {
      toast.error('Please enter company or customer name.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving payment transaction updates...');

    try {
      const pId = payment.paymentId || payment.id || payment.invoiceNumber;
      const updates = {
        ...formData,
        accountName: formData.company,
        method: formData.paymentMethod,
        paymentMode: formData.paymentMethod,
        solutionCategory: formData.productName,
        service: formData.productName
      };

      const res = await paymentApi.updatePayment(pId, updates);
      const updated = res || { ...payment, ...updates };

      onUpdated?.(updated);

      notificationApi.createNotification({
        type: 'payment_received',
        title: 'Payment Record Updated',
        message: `Payment ${formData.invoiceNumber || pId} for ${formData.company} was updated (Status: ${formData.status}, Amount: ${formData.receivedAmount}).`,
        severity: 'info',
        entityType: 'payment',
        entityId: pId
      });

      toast.success('Payment updated successfully!', { id: toastId });
      onClose();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="adm-modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          borderRadius: '18px',
          background: '#ffffff',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Edit Payment Transaction
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Invoice / ID: <strong style={{ fontFamily: 'monospace' }}>{payment.invoiceNumber || payment.paymentId || payment.id}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Section: Entity & Contact Details */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Company &amp; Contact Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label className="adm-modal-label">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  className="adm-modal-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Bio Sil Laboratories Co"
                />
              </div>

              <div>
                <label className="adm-modal-label">Customer / Contact Person</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="e.g. Nitesh Agarwal"
                />
              </div>

              <div>
                <label className="adm-modal-label">Contact Email</label>
                <input
                  type="email"
                  className="adm-modal-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. accounts@biosil.com"
                />
              </div>
            </div>
          </div>

          {/* Section: Invoice & Product Details */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Invoice &amp; Product Info
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label className="adm-modal-label">Invoice Number</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="e.g. INV-2026-0042"
                />
              </div>

              <div>
                <label className="adm-modal-label">Invoice Date</label>
                <input
                  type="date"
                  className="adm-modal-input"
                  value={formData.invoiceDate ? formData.invoiceDate.slice(0, 10) : ''}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-modal-label">Product / Plan / Category</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Tally Prime Cloud Server"
                />
              </div>
            </div>
          </div>

          {/* Section: Financial Amounts */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Payment Amounts &amp; Taxes
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
              <div>
                <label className="adm-modal-label">Received Amount</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.receivedAmount}
                  onChange={(e) => setFormData({ ...formData, receivedAmount: e.target.value, amount: e.target.value })}
                  placeholder="e.g. ₹39,648"
                />
              </div>

              <div>
                <label className="adm-modal-label">Pending Payment</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.pendingPayment}
                  onChange={(e) => setFormData({ ...formData, pendingPayment: e.target.value })}
                  placeholder="e.g. ₹0"
                />
              </div>

              <div>
                <label className="adm-modal-label">Taxable Base</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.taxableAmount}
                  onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
                  placeholder="e.g. ₹33,600"
                />
              </div>

              <div>
                <label className="adm-modal-label">GST (18%)</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.gstAmount}
                  onChange={(e) => setFormData({ ...formData, gstAmount: e.target.value })}
                  placeholder="e.g. ₹6,048"
                />
              </div>
            </div>
          </div>

          {/* Section: Instrument & Banking Details */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Banking &amp; Settlement Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label className="adm-modal-label">Payment Method</label>
                <select
                  className="adm-modal-input"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="adm-modal-label">Cheque / Reference Number / UTR</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g. CHQ-928371 / UTR CMS182749"
                />
              </div>

              <div>
                <label className="adm-modal-label">Bank / Branch Name</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank - Salt Lake"
                />
              </div>

              <div>
                <label className="adm-modal-label">Realisation / Deposit Date</label>
                <input
                  type="date"
                  className="adm-modal-input"
                  value={formData.depositDate ? formData.depositDate.slice(0, 10) : ''}
                  onChange={(e) => setFormData({ ...formData, depositDate: e.target.value })}
                />
              </div>

              <div>
                <label className="adm-modal-label">Sales Person / Handled By</label>
                <input
                  type="text"
                  className="adm-modal-input"
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                  placeholder="e.g. Nilmoni Ghosal"
                />
              </div>

              <div>
                <label className="adm-modal-label">Payment Status</label>
                <select
                  className="adm-modal-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {PAYMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Remarks / Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label className="adm-modal-label">Remarks / Notes</label>
            <textarea
              className="adm-modal-input"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional internal audit notes or settlement details..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="adm-import-btn-clear"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Payment Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
