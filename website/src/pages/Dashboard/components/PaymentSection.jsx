import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Lock
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI / Scan & Pay',
    desc: 'GPay, PhonePe, Paytm or any UPI app — instant confirmation',
    icon: QrCode
  },
  {
    id: 'netbanking',
    name: 'Corporate Net Banking',
    desc: 'HDFC, ICICI, SBI, Axis, Kotak, and all major banks',
    icon: Building
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa, MasterCard, RuPay corporate & personal cards',
    icon: CreditCard
  }
];

export default function PaymentSection({
  pendingAmount = 5310,
  onPaymentSuccess,
  customer,
  onViewReceipts
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [receiptRef, setReceiptRef] = useState('');

  const cgst = Math.round((pendingAmount * 9) / 118);
  const sgst = cgst;
  const base = pendingAmount - cgst - sgst;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const ref = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceiptRef(ref);
      setIsProcessing(false);
      setPaymentDone(true);

      if (onPaymentSuccess) {
        const modeLabel =
          PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name ?? selectedMethod;
        onPaymentSuccess({
          id: ref,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          service: 'TSS Subscription & Cloud Infrastructure',
          gstRate: '18% GST',
          taxAmount: `₹${(cgst + sgst).toLocaleString('en-IN')}`,
          totalAmount: `₹${pendingAmount.toLocaleString('en-IN')}`,
          status: 'Paid',
          paymentMode: modeLabel
        });
      }
    }, 1200);
  };

  /* ── Success state ─────────────────────────────────────────────────── */
  if (paymentDone) {
    return (
      <div className="cliento-card pay-success-card animate-fade-in">
        <div className="pay-success-ring">
          <CheckCircle2 size={32} color="#059669" />
        </div>

        <h3 className="pay-success-title">Payment Confirmed</h3>
        <p className="pay-success-desc">
          ₹{pendingAmount.toLocaleString('en-IN')} received successfully. Your GST tax receipt is ready.
        </p>

        <div className="pay-meta-grid">
          <div className="pay-meta-row">
            <span className="pay-meta-label">Receipt No.</span>
            <span className="pay-meta-value font-mono">{receiptRef}</span>
          </div>
          <div className="pay-meta-row">
            <span className="pay-meta-label">Amount Paid</span>
            <span className="pay-meta-value">₹{pendingAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="pay-meta-row">
            <span className="pay-meta-label">Payment Mode</span>
            <span className="pay-meta-value">
              {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}
            </span>
          </div>
          <div className="pay-meta-row">
            <span className="pay-meta-label">Status</span>
            <span className="pay-meta-value status-green">Paid & Verified</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <button type="button" className="cliento-btn-export" onClick={onViewReceipts}>
            <Receipt size={14} />
            <span>View Receipts</span>
          </button>
          <button type="button" className="cliento-btn-filter" onClick={() => setPaymentDone(false)}>
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  /* ── Payment layout matching sidebar font & style ─────────────────── */
  return (
    <div className="cliento-payment-layout animate-fade-in">
      {/* ── Left: Method Selection ──────────────────────────────────── */}
      <div className="cliento-card cliento-payment-methods-card">
        <div className="cliento-card-head">
          <div className="cliento-card-title-group">
            <CreditCard size={18} className="cliento-card-icon" />
            <h3 className="cliento-card-title">Select Payment Method</h3>
          </div>
          <span className="cliento-secure-badge">
            <ShieldCheck size={13} color="#059669" />
            256-Bit SSL
          </span>
        </div>

        <div className="cliento-pay-methods-list">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMethod === m.id;
            return (
              <div
                key={m.id}
                className={`cliento-pay-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(m.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedMethod(m.id)}
              >
                <div className="cliento-pay-icon-box">
                  <Icon size={18} />
                </div>
                <div className="cliento-pay-info">
                  <div className="cliento-pay-name">{m.name}</div>
                  <div className="cliento-pay-desc">{m.desc}</div>
                </div>
                <div className={`cliento-pay-radio ${isSelected ? 'checked' : ''}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Billing Summary ──────────────────────────────────── */}
      <div className="cliento-card cliento-billing-summary-card">
        <div className="cliento-card-head">
          <h3 className="cliento-card-title">Billing Summary</h3>
        </div>

        {customer && (
          <div className="cliento-customer-summary-pill">
            <div className="cliento-cust-company">{customer.companyName || 'Enterprise Node'}</div>
            <div className="cliento-cust-gstin">GSTIN: {customer.gstNo || '19AAAAA0000A1Z5'}</div>
          </div>
        )}

        <div className="cliento-summary-lines">
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">Base Amount</span>
            <span className="cliento-sum-val">₹{base.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">CGST (9%)</span>
            <span className="cliento-sum-val">₹{cgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">SGST (9%)</span>
            <span className="cliento-sum-val">₹{sgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-divider" />
          <div className="cliento-summary-row total-row">
            <span className="cliento-sum-total-label">Total</span>
            <span className="cliento-sum-total-val">₹{pendingAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          type="button"
          className="cliento-pay-btn"
          onClick={handlePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="ebolt-spinner" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock size={14} />
              <span>Pay ₹{pendingAmount.toLocaleString('en-IN')}</span>
            </>
          )}
        </button>

        <div className="cliento-pci-badge">
          <ShieldCheck size={13} color="#059669" />
          <span>PCI-DSS Compliant • Instant Activation</span>
        </div>
      </div>
    </div>
  );
}
