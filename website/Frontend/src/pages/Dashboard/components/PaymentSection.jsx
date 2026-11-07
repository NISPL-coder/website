import { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Lock,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi } from '../../../services/dashboardApi';
import { razorpayApi, loadRazorpayCheckout } from '../../../services/razorpayApi';
import { useIsMobile, useIsPhone } from '../../../utils/useResponsive';

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

const GATEWAY_GUARANTEES = [
  {
    icon: Lock,
    title: 'We never see your credentials',
    desc: 'Card, UPI and net banking details are entered only inside Razorpay’s window.'
  },
  {
    icon: ShieldCheck,
    title: 'Signature-verified',
    desc: 'Our server re-checks Razorpay’s HMAC signature before any payment is accepted.'
  },
  {
    icon: Receipt,
    title: 'GST invoice generated',
    desc: 'The same official invoice and ledger entry an offline payment gets.'
  },
  {
    icon: CheckCircle2,
    title: 'Settles instantly',
    desc: 'Dues, renewals and cart totals refresh the moment the payment is captured.'
  }
];

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const prettyDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('en-GB');
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PaymentSection({
  checkout,
  account,
  customer,
  loading = false,
  onPaymentSuccess,
  onViewReceipts,
  onBrowseProducts
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paid, setPaid] = useState(null);
  const [error, setError] = useState('');
  const [gateway, setGateway] = useState(null);
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();

  // Which way the Pay button goes is decided by the server, so a deployment
  // without gateway keys keeps its existing bank-transfer flow.
  useEffect(() => {
    let cancelled = false;

    razorpayApi
      .getConfig()
      .then((config) => {
        if (!cancelled) setGateway(config);
      })
      .catch(() => {
        if (!cancelled) setGateway({ enabled: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const modeLabel = PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name ?? selectedMethod;
  const amount = Math.round(Number(checkout?.amount) || 0);
  const gst = Math.round(Number(checkout?.gst) || 0);
  const base = Math.round(Number(checkout?.subtotal) || 0);
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;

  const billTo = account?.company || customer?.companyName || customer?.company || customer?.name || '';
  const billGSTIN = account?.gstNo || customer?.gstNo || '';

  const gatewayEnabled = Boolean(gateway?.enabled);

  // The gateway caps a single transaction, and the server owns that number.
  // Above it the customer keeps the bank-transfer picker instead of meeting
  // the limit inside Razorpay's own window.
  const maxOnline = Number(gateway?.maxAmount) || Infinity;
  const canPayOnline = gatewayEnabled && amount <= maxOnline;
  const isTestMode = gateway?.isTestMode !== undefined
    ? Boolean(gateway.isTestMode)
    : (String(gateway?.keyId || '').startsWith('rzp_test_') || String(import.meta.env.VITE_RAZORPAY_TEST_MODE).toLowerCase() === 'true');

  // Tells the server which of the account's charges to price. The rupees
  // themselves are always read from the database, never from here.
  const checkoutScopePayload = (methodHint) => {
    const payload = { method: methodHint };
    if (checkout.mode === 'dues') payload.settleAll = true;
    else if (checkout.mode === 'renewal') payload.contractId = checkout.contractId;
    return payload;
  };

  const showReceipt = (data, fallbackTotal, fallbackMode) => {
    const payment = data?.payment || {};
    const total = Math.round(Number(data?.totals?.total) || fallbackTotal);

    setPaid({
      ref: payment.invoiceNumber || payment.id || '—',
      amount: total,
      mode: payment.paymentMethod || fallbackMode,
      date: prettyDate(payment.date),
      count: Array.isArray(data?.payments) ? data.payments.length : 1,
      alreadySettled: Boolean(data?.alreadySettled),
      gatewayPaymentId: data?.gateway?.paymentId || '',
      contracts: Array.isArray(data?.contracts) ? data.contracts : []
    });
    setPaymentDone(true);

    if (data?.alreadySettled) {
      toast.success('That invoice was already settled.');
    } else {
      toast.success(`${inr(total)} received — your receipt is ready.`);
    }

    if (onPaymentSuccess) onPaymentSuccess(data);
  };

  const handlePay = async () => {
    if (!amount) {
      setError('There is nothing due on this account right now.');
      return;
    }

    let currentGateway = gateway;
    if (!currentGateway) {
      try {
        currentGateway = await razorpayApi.getConfig();
        setGateway(currentGateway);
      } catch {
        currentGateway = { enabled: false };
      }
    }

    const onlinePossible = Boolean(currentGateway?.enabled) && amount <= (Number(currentGateway?.maxAmount) || Infinity);

    if (onlinePossible) {
      await handleGatewayPay();
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const data = await dashboardApi.submitPayment(checkoutScopePayload(modeLabel));
      showReceipt(data, amount, modeLabel);
    } catch (err) {
      const message = err?.message || 'Payment could not be recorded. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGatewayPay = async () => {
    setIsProcessing(true);
    setError('');

    const checkoutReady = await loadRazorpayCheckout();

    if (!checkoutReady) {
      setIsProcessing(false);
      const message =
        'Could not reach the secure payment page. Check your connection or ad-blocker and try again.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const order = await razorpayApi.createOrder(checkoutScopePayload('razorpay'));

      const gatewayWindow = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: order.name,
        description: order.label,
        order_id: order.orderId,
        prefill: order.prefill,
        notes: { intent: order.intentId },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast('Payment window closed — nothing was charged.');
          }
        },
        handler: async (response) => {
          try {
            const data = await razorpayApi.verifyPayment(response);
            showReceipt(data, order.amount, order.label);
          } catch (err) {
            if (err?.statusCode === 202) {
              // Captured at Razorpay, ledger still being written by the webhook.
              setError(err.message);
              toast('Payment successful — your receipt is being generated.');
            } else {
              setError(err?.message || 'Your payment is confirmed but not recorded yet. Please contact support.');
              toast.error('We could not confirm this payment. Please contact support before trying again.');
            }
          } finally {
            setIsProcessing(false);
          }
        }
      });

      gatewayWindow.on('payment.failed', (response) => {
        setIsProcessing(false);
        setError(
          response?.error?.description
            ? `Payment failed: ${response.error.description}`
            : 'The payment could not be completed. Nothing was charged.'
        );
      });

      gatewayWindow.open();
    } catch (err) {
      setIsProcessing(false);
      const message = err?.message || 'Could not start the payment. Please try again.';
      setError(message);
      toast.error(message);
    }
  };

  /* ── Ledger still loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flowmail-section-wrapper animate-fade-in">
        <section className="flowmail-state-card">
          <span className="flowmail-state-spinner" />
          <p className="flowmail-state-text">Checking what is due on your account…</p>
        </section>
      </div>
    );
  }

  /* ── Nothing due state (FlowMail Theme) ──────────────────────────────── */
  // The just-paid receipt takes priority: settling the dues empties the ledger
  // the checkout is computed from.
  if (!paymentDone && checkout?.mode === 'none') {
    return (
      <div className="flowmail-section-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section className="flowmail-welcome-banner">
          <div className="flowmail-welcome-text">
            <h2 className="flowmail-welcome-title">Secure Checkout &amp; Payment</h2>
            <p className="flowmail-welcome-sub">
              Payments are recorded straight onto your account ledger, so receipts update immediately.
            </p>
          </div>
        </section>

        <div className="flowmail-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', textAlign: 'center', padding: isPhone ? '28px 18px' : '40px 32px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#e6f9ed',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            Nothing is due
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0' }}>
            Every invoice on this account is settled and your cart is empty, so there is nothing to pay right now.
          </p>

          <div style={{ display: 'flex', flexDirection: isPhone ? 'column' : 'row', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="flowmail-btn-primary" onClick={onBrowseProducts} style={{ padding: '10px 22px', width: isPhone ? '100%' : undefined, justifyContent: isPhone ? 'center' : undefined }}>
              <ArrowRight size={15} />
              <span>Browse Products</span>
            </button>
            <button type="button" className="flowmail-btn-secondary" onClick={onViewReceipts} style={{ padding: '10px 20px', width: isPhone ? '100%' : undefined, justifyContent: isPhone ? 'center' : undefined }}>
              <Receipt size={15} />
              <span>View Receipts</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flowmail-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%', textAlign: 'center', padding: isPhone ? '28px 18px' : '40px 32px' }}>
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
            {paid?.alreadySettled ? 'Already Settled' : 'Payment Confirmed'}
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0' }}>
            {paid?.alreadySettled
              ? 'This invoice was already marked as received on your account.'
              : `${inr(paid?.amount)} received${paid?.count > 1 ? ` and ${paid.count} invoices settled` : ''}. The entry is on your account ledger.`}
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: isPhone ? '14px 14px' : '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Invoice / Receipt No.</span>
              <span style={{ color: '#6366f1', fontWeight: '700' }} className="flowmail-receipt-id-badge">{paid?.ref}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Amount Paid</span>
              <span style={{ color: '#0f172a', fontWeight: '700' }}>{inr(paid?.amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Payment Mode</span>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{paid?.mode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Date</span>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{paid?.date}</span>
            </div>
            {paid?.gatewayPaymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Razorpay Payment ID</span>
                <span style={{ color: '#0f172a', fontWeight: '500', wordBreak: 'break-all' }}>
                  {paid.gatewayPaymentId}
                </span>
              </div>
            )}
            {paid?.contracts?.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>
                  Contract{paid.contracts.length > 1 ? 's' : ''} Raised
                </span>
                <span style={{ color: '#0f172a', fontWeight: '500', textAlign: 'right' }}>
                  {paid.contracts.map((contract) => contract.contractId).join(', ')}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Status</span>
              <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
                Paid &amp; Verified
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isPhone ? 'column' : 'row', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="flowmail-btn-primary"
              onClick={onViewReceipts}
              style={{ padding: '10px 22px', width: isPhone ? '100%' : undefined, justifyContent: isPhone ? 'center' : undefined }}
            >
              <Receipt size={15} />
              <span>View &amp; Download Receipt</span>
            </button>
            <button
              type="button"
              className="flowmail-btn-secondary"
              onClick={() => {
                setPaymentDone(false);
                setPaid(null);
                setError('');
              }}
              style={{ padding: '10px 20px', width: isPhone ? '100%' : undefined, justifyContent: isPhone ? 'center' : undefined }}
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
      <div className="pay-split-layout" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1.45fr) 385px', gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>
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
              <h3 className="flowmail-card-title">
                {canPayOnline ? 'Pay with Razorpay' : 'Select Payment Method'}
              </h3>
            </div>
            <span className="flowmail-trend-pill positive" style={{ fontSize: '0.74rem' }}>
              Instant Verification
            </span>
          </div>

          {canPayOnline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Razorpay Environment Mode Toggle Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: isTestMode ? '#fffbeb' : '#f0fdf4',
                border: isTestMode ? '1.5px solid #fde68a' : '1.5px solid #bbf7d0',
                boxShadow: isTestMode ? '0 1px 3px rgba(245, 158, 11, 0.1)' : '0 1px 3px rgba(34, 197, 94, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isTestMode ? '#fef3c7' : '#dcfce7',
                    color: isTestMode ? '#d97706' : '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isTestMode ? <FlaskConical size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: isTestMode ? '#92400e' : '#166534' }}>
                        Razorpay {isTestMode ? 'Test Mode (Sandbox)' : 'Live Production Mode'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: isTestMode ? '#f59e0b' : '#22c55e',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
                        {isTestMode ? 'Test ON' : 'Live ON'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: isTestMode ? '#b45309' : '#15803d', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                      {isTestMode
                        ? 'Simulated payments active via RAZORPAY_TEST_MODE=true in .env. Test cards & UPI work without deducting real money.'
                        : 'Live payments active via RAZORPAY_TEST_MODE=false in .env. Real bank cards and UPI accounts will be charged.'}
                    </p>
                  </div>
                </div>

                {/* Visual Toggle Pill Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: '600', color: isTestMode ? '#b45309' : '#15803d' }}>
                    {isTestMode ? 'TEST' : 'LIVE'}
                  </span>
                  <div
                    title={`Controlled by RAZORPAY_TEST_MODE=${isTestMode ? 'true' : 'false'} in .env`}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '9999px',
                      background: isTestMode ? '#f59e0b' : '#22c55e',
                      position: 'relative',
                      boxShadow: isTestMode ? '0 0 6px rgba(245, 158, 11, 0.4)' : '0 0 6px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: isTestMode ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)'
                    }} />
                  </div>
                </div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '16px', padding: isPhone ? '14px 14px' : '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: '700', color: '#0f172a' }}>
                    Razorpay Secure Checkout
                  </span>
                  <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.72rem' }}>
                    UPI &bull; Cards &bull; Net Banking &bull; Wallets &bull; EMI
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                  The payment opens in Razorpay&rsquo;s own verified window and you pick the method there.
                  Your card, UPI and bank details never reach this website — we accept the transaction only
                  after Razorpay signs it and our server verifies that signature.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: isPhone ? '14px' : '14px 18px' }}>
                {GATEWAY_GUARANTEES.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Icon size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>
                          {point.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                          {point.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* ── Right: Billing Summary Card ─────────────────────── */}
        <div className="flowmail-card">
          <div className="flowmail-card-header-row" style={{ marginBottom: '16px' }}>
            <h3 className="flowmail-card-title">Billing Summary</h3>
            <span className="flowmail-trend-pill indigo" style={{ fontSize: '0.74rem' }}>
              {gst > 0 ? '18% GST' : 'Invoice total'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
              {checkout?.label || 'NISPL account'}
            </div>
            {billTo && (
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                {billTo}
                {billGSTIN ? ` • GSTIN: ${billGSTIN}` : ' • GSTIN not on record'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#64748b' }}>Base Amount</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>{inr(base)}</span>
            </div>
            {gst > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: '#64748b' }}>CGST (9%)</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{inr(cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: '#64748b' }}>SGST (9%)</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{inr(sgst)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>GST</span>
                <span style={{ color: '#94a3b8', fontWeight: '600', fontSize: '0.8rem' }}>
                  Included in the invoice
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>Total Payable</span>
              <span style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8' }}>
                {checkout?.mode === 'dues'
                  ? `${checkout.invoiceCount} open invoice${checkout.invoiceCount === 1 ? '' : 's'}`
                  : 'Tax Inclusive'}
              </span>
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: '#6366f1' }}>
              {inr(amount)}
            </span>
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.4 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="flowmail-btn-primary"
            onClick={handlePay}
            disabled={isProcessing || !amount || !gateway}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.94rem' }}
          >
            {isProcessing ? (
              <span>Processing Payment...</span>
            ) : (
              <>
                <Lock size={15} />
                <span>{canPayOnline ? `Pay ${inr(amount)} securely` : `Pay ${inr(amount)}`}</span>
              </>
            )}
          </button>

          {canPayOnline ? (
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center', margin: '10px 0 0 0', lineHeight: 1.45 }}>
              Opens Razorpay&rsquo;s verified window for UPI, cards, net banking, wallets and EMI.
            </p>
          ) : (
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center', margin: '10px 0 0 0', lineHeight: 1.45 }}>
              {gatewayEnabled
                ? `Invoices above ${inr(maxOnline)} are settled by bank transfer against the selected method.`
                : 'Paid by bank transfer? Our accounts team marks the invoice received.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
