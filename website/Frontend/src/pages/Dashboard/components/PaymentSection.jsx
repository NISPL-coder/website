import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Lock,
  ArrowLeft
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI / Scan & Pay',
    desc: 'GPay, PhonePe, Paytm or any UPI app — instant payment verification',
    icon: QrCode
  },
  {
    id: 'netbanking',
    name: 'Corporate Net Banking',
    desc: 'HDFC, ICICI, SBI, Axis, Kotak, and all major commercial banks',
    icon: Building
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa, MasterCard, RuPay corporate & commercial credit cards',
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

  /* ── Success state (FlowMail Theme) ────────────────────────────────── */
  if (paymentDone) {
    return (
      <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section className="flowmail-welcome-banner">
          <div className="flowmail-welcome-text">
            <h2 className="flowmail-welcome-title">Payment Confirmation</h2>
            <p className="flowmail-welcome-sub">
              Your transaction has been processed and verified successfully.
            </p>
          </div>
        </section>

        <div className="flowmail-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#e6f9ed',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            Payment Confirmed
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0' }}>
            ₹{pendingAmount.toLocaleString('en-IN')} received successfully. Your official GST tax invoice is generated.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Receipt Ref No.</span>
              <span style={{ color: '#6366f1', fontWeight: '700' }} className="flowmail-receipt-id-badge">{receiptRef}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Amount Paid</span>
              <span style={{ color: '#0f172a', fontWeight: '700' }}>₹{pendingAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Payment Mode</span>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>
                {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Status</span>
              <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
                Paid &amp; Verified
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="flowmail-btn-primary"
              onClick={onViewReceipts}
              style={{ padding: '10px 22px' }}
            >
              <Receipt size={15} />
              <span>View &amp; Download Receipt</span>
            </button>
            <button
              type="button"
              className="flowmail-btn-secondary"
              onClick={() => setPaymentDone(false)}
              style={{ padding: '10px 20px' }}
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Payment layout (FlowMail Theme) ─────────────────── */
  return (
    <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Header Banner (FlowMail Style) ────────────────── */}
      <section className="flowmail-welcome-banner">
        <div className="flowmail-welcome-text">
          <h2 className="flowmail-welcome-title">Secure Checkout &amp; Payment</h2>
          <p className="flowmail-welcome-sub">
            Complete your subscription transaction with 256-bit bank-grade encryption. Official GST tax receipts are generated instantly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="flowmail-trend-pill positive" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            <ShieldCheck size={14} />
            <span>PCI-DSS Compliant &bull; 256-Bit SSL</span>
          </span>
        </div>
      </section>

      {/* ── 2-Column Payment Grid ─────────────────────────────── */}
      <div className="pay-split-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) 385px', gap: '24px', alignItems: 'start' }}>
        {/* ── Left: Method Selection Card ─────────────────────── */}
        <div className="flowmail-card">
          <div className="flowmail-card-header-row" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ede9fe',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={18} />
              </div>
              <h3 className="flowmail-card-title">Select Payment Method</h3>
            </div>
            <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
              Instant Verification
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedMethod(m.id)}
                  style={{
                    border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: isSelected ? '#f5f3ff' : '#ffffff',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isSelected ? '#ede9fe' : '#f8fafc',
                    color: isSelected ? '#6366f1' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.35 }}>
                      {m.desc}
                    </div>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '6px solid #6366f1' : '2px solid #cbd5e1',
                    background: '#ffffff',
                    flexShrink: 0
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Billing Summary Card ─────────────────────── */}
        <div className="flowmail-card">
          <div className="flowmail-card-header-row" style={{ marginBottom: '16px' }}>
            <h3 className="flowmail-card-title">Billing Summary</h3>
            <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
              18% GST
            </span>
          </div>

          {customer && (
            <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                {customer.companyName || 'Corporate Account'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                GSTIN: {customer.gstNo || '19AAAAA0000A1Z5'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Base Amount</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{base.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>CGST (9%)</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>SGST (9%)</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{sgst.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>Total Payable</span>
              <span style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8' }}>Tax Inclusive</span>
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: '#6366f1' }}>
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            className="flowmail-btn-primary"
            onClick={handlePay}
            disabled={isProcessing}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.94rem' }}
          >
            {isProcessing ? (
              <span>Processing Payment...</span>
            ) : (
              <>
                <Lock size={15} />
                <span>Pay ₹{pendingAmount.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
