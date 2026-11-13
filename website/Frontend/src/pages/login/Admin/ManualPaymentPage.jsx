import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  ArrowLeft,
  Banknote,
  FileCheck,
  FileText,
  FileUp,
  Image as ImageIcon,
  Landmark,
  Layers,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { paymentApi } from '../../../services/paymentApi';
import { staffApi } from '../../../services/staffApi';
import { productApi } from '../../../services/productApi';
import { usePermissions } from './PermissionsContext';

// How the money physically arrived. Each instrument is proved by a different
// document, so the reference label and the proof rule come from this table
// rather than from a condition written at every field.
const INSTRUMENTS = [
  { value: 'Cheque', label: 'Cheque', referenceLabel: 'Cheque number', proofRequired: true },
  { value: 'Demand Draft', label: 'Demand Draft', referenceLabel: 'DD number', proofRequired: true },
  { value: 'NEFT / RTGS', label: 'NEFT / RTGS', referenceLabel: 'UTR / NEFT reference number' },
  { value: 'IMPS', label: 'IMPS', referenceLabel: 'UTR / RRN number' },
  { value: 'Bank Transfer', label: 'Bank Transfer', referenceLabel: 'UTR / transaction reference' },
  { value: 'UPI Transfer', label: 'UPI Transfer', referenceLabel: 'UPI reference / UTR number' },
  { value: 'Card Swipe', label: 'Card Swipe (at office)', referenceLabel: 'Card slip reference' },
  { value: 'Cash', label: 'Cash', referenceLabel: 'Receipt voucher number', referenceOptional: true }
];

const SETTLEMENT_STATUSES = [
  { value: 'Received', label: 'Received & Settled' },
  { value: 'Cleared', label: 'Cleared by Bank' },
  { value: 'Pending', label: 'Pending Bank Verification' },
  { value: 'Overdue', label: 'Overdue' }
];

const GST_RATE = 0.18;

const GST_BASES = [
  { value: 'inclusive', label: 'Amount includes 18% GST' },
  { value: 'exclusive', label: 'Amount is before GST (add 18%)' },
  { value: 'none', label: 'GST not applicable / not recorded' }
];

const PROOF_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

const today = () => new Date().toISOString().slice(0, 10);

const rupees = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const amountNumber = (value) => {
  const parsed = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const sizeLabel = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(Math.round(bytes / 1024), 1)} KB`;

export default function ManualPaymentPage({
  payments,
  setPayments,
  customers = [],
  contracts = [],
  products: catalogue = []
}) {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canRecord = can('manual_payment', 'create');

  const [formState, setFormState] = useState({
    company: '',
    customer: '',
    email: '',
    customerId: '',
    contractId: '',
    productId: '',
    salesPerson: '',
    amount: '',
    gstBasis: 'inclusive',
    instrument: 'Cheque',
    referenceNumber: '',
    bankName: '',
    depositDate: '',
    paymentReceivedDate: today(),
    invoiceDate: today(),
    invoiceNumber: '',
    status: 'Received',
    notes: ''
  });
  const [proof, setProof] = useState(null);
  const [isDraggingProof, setIsDraggingProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const proofInputRef = useRef(null);

  const instrument = INSTRUMENTS.find((i) => i.value === formState.instrument) || INSTRUMENTS[0];
  const proofRequired = Boolean(instrument.proofRequired);

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: c.company || c.name,
        label: `${c.company || c.name}${c.name ? ` (${c.name})` : ''}`,
        customer: c
      })),
    [customers]
  );

  // Only subscriptions this account holds, so an offline payment cannot be
  // filed against somebody else's term.
  const contractOptions = useMemo(() => {
    const chosen = formState.company.trim().toLowerCase();
    return contracts
      .filter((c) => {
        if (!chosen) return true;
        const owner = String(c.company || c.customer || c.accountName || '').trim().toLowerCase();
        return owner === chosen;
      })
      .map((c) => ({
        value: c.contractId || c.id,
        label: `${c.name || c.contractId} — ${c.contractId || c.id}`,
        contract: c
      }));
  }, [contracts, formState.company]);

  const [liveProducts, setLiveProducts] = useState(catalogue);

  useEffect(() => {
    if (Array.isArray(catalogue) && catalogue.length > 0) {
      setLiveProducts(catalogue);
    }
  }, [catalogue]);

  useEffect(() => {
    let cancelled = false;
    productApi.getProducts().then((data) => {
      if (!cancelled && Array.isArray(data)) {
        setLiveProducts(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleDataChanged = (e) => {
      const resource = e?.detail?.resource;
      if (!resource || resource === '*' || resource === 'products') {
        productApi.getProducts().then((data) => {
          if (Array.isArray(data)) setLiveProducts(data);
        });
      }
    };
    window.addEventListener('nispl_data_changed', handleDataChanged);
    return () => window.removeEventListener('nispl_data_changed', handleDataChanged);
  }, []);

  const effectiveProducts = liveProducts && liveProducts.length > 0 ? liveProducts : catalogue;

  const productOptions = useMemo(
    () =>
      (effectiveProducts || [])
        .filter((p) => p.available !== false && p.status !== 'inactive')
        .map((p) => ({
          value: p.productId || p.id || p._id,
          label: p.name || p.title || 'Unnamed Product',
          product: p
        })),
    [effectiveProducts]
  );

  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    staffApi
      .getStaff()
      .then((rows) => {
        if (cancelled) return;
        setStaffOptions(
          (Array.isArray(rows) ? rows : [])
            .filter((s) => s.accountStatus !== 'inactive')
            .map((s) => {
              const value = s.name || s.email || '';
              const title = s.designation || s.role || '';
              return { value, label: title ? `${value} (${title})` : value };
            })
            .filter((o) => o.value)
        );
      })
      .catch(() => {
        // Without user_access:view the list is empty and the admin types a name.
        if (!cancelled) setStaffOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key) => (value) => setFormState((prev) => ({ ...prev, [key]: value }));

  const handleSelectCustomer = (companyName) => {
    const matched = customers.find((c) => (c.company || c.name) === companyName);
    if (!matched) return;
    setFormState((prev) => ({
      ...prev,
      company: matched.company || matched.name || '',
      customer: matched.name || '',
      email: matched.email || matched.loginEmail || '',
      customerId: matched.customerId || '',
      contractId: contractOptions.some((o) => o.value === prev.contractId) ? prev.contractId : ''
    }));
  };

  const handleContractChange = (opt) => {
    const contract = opt?.contract;
    setFormState((prev) => ({
      ...prev,
      contractId: opt ? opt.value : '',
      productId: contract?.productId || prev.productId,
      // An offline payment usually settles an agreed term, so the contracted
      // value prefills the amount the admin then corrects to what arrived.
      amount: prev.amount || rupees(amountNumber(contract?.totalContractValue || contract?.value))
    }));
  };

  const handleProofFile = (file) => {
    if (!file) return;
    if (!PROOF_TYPES.includes(file.type)) {
      toast.error('Proof must be a PNG, JPG, WEBP image or a PDF.');
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      toast.error(`Proof document is ${sizeLabel(file.size)} — the limit is 5 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setProof({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        data: String(reader.result || '')
      });
    reader.onerror = () => toast.error('The file could not be read. Please attach it again.');
    reader.readAsDataURL(file);
  };

  const split = () => {
    const entered = amountNumber(formState.amount);
    if (formState.gstBasis === 'exclusive') {
      const taxable = Math.round(entered);
      const gst = Math.round(taxable * GST_RATE);
      return { taxable, gst, gross: taxable + gst };
    }
    if (formState.gstBasis === 'none') {
      return { taxable: Math.round(entered), gst: 0, gross: Math.round(entered) };
    }
    const taxable = Math.round(entered / (1 + GST_RATE));
    return { taxable, gst: Math.round(entered) - taxable, gross: Math.round(entered) };
  };

  const basisLabel = () => {
    if (formState.gstBasis === 'exclusive') return `GST added at ${GST_RATE * 100}% on the entered amount`;
    if (formState.gstBasis === 'none') return 'Recorded without GST';
    return `Entered amount taken as GST-inclusive and split at ${GST_RATE * 100}%`;
  };

  const validate = () => {
    if (!formState.company.trim()) return ['company', 'Select customer.'];
    if (!(amountNumber(formState.amount) > 0)) return ['amount', 'Enter the amount received.'];
    if (!formState.paymentReceivedDate) return ['paymentReceivedDate', 'Enter the date the money was received.'];
    if (!formState.referenceNumber.trim() && !instrument.referenceOptional)
      return ['referenceNumber', `${instrument.referenceLabel} is needed to match this against the bank statement.`];
    if (proofRequired && !proof)
      return ['proof', `Attach a scan or photo of the ${instrument.value.toLowerCase()} as proof of payment.`];
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [badField, message] = validate();
    if (badField) {
      toast.error(message);
      if (badField !== 'proof') document.querySelector(`[data-field="${badField}"]`)?.focus();
      return;
    }

    const { taxable, gst, gross } = split();
    const product = productOptions.find((p) => p.value === formState.productId)?.product;
    const contract = contractOptions.find((c) => c.value === formState.contractId)?.contract;
    const isSettled = formState.status === 'Received' || formState.status === 'Cleared';

    const payload = {
      company: formState.company.trim(),
      customer: formState.customer.trim() || formState.company.trim(),
      email: formState.email.trim(),
      customerId: formState.customerId.trim(),
      contractId: formState.contractId,
      productId: formState.productId,
      salesPerson: formState.salesPerson.trim(),
      amount: rupees(gross),
      receivedAmount: isSettled ? rupees(gross) : '₹0',
      pendingPayment: isSettled ? '₹0' : rupees(gross),
      paymentMethod: formState.instrument,
      referenceNumber: formState.referenceNumber.trim(),
      bankName: formState.bankName.trim(),
      depositDate: formState.depositDate,
      notes: formState.notes.trim(),
      status: formState.status,
      invoiceDate: formState.invoiceDate,
      paymentReceivedDate: formState.paymentReceivedDate,
      invoiceNumber: formState.invoiceNumber.trim(),
      solutionCategory: product?.name || contract?.name || formState.company.trim(),
      taxableAmount: rupees(taxable),
      gstAmount: rupees(gst),
      gstBasis: basisLabel(),
      items: product
        ? [
            {
              productId: product.productId || product.id || '',
              name: product.name || '',
              sku: product.sku || '',
              category: product.category || '',
              provider: product.provider || '',
              users: Number(product.users) || 0,
              serverConfiguration: product.serverConfiguration || '',
              cores: product.cores || '',
              ram: product.ram || '',
              storage: product.storage || '',
              billingCycle: contract?.subscriptionPeriod || product.frequency || '',
              quantity: 1,
              basePrice: taxable,
              gstAmount: gst,
              finalPrice: gross
            }
          ]
        : [],
      proof: proof || undefined
    };

    setIsSubmitting(true);
    try {
      const saved = await paymentApi.recordManualPayment(payload);

      if (setPayments) setPayments([saved, ...payments]);

      toast.success(
        `${instrument.value} payment ${saved?.invoiceNumber || payload.invoiceNumber || ''} recorded against ${payload.company}.`,
        { style: { borderRadius: '12px', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' } }
      );

      navigate('/admin/customer/payment');
    } catch (err) {
      console.error('[ManualPaymentPage] error:', err);
      toast.error(err.message || 'Failed to record the offline payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const preview = split();

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Navigation & Header */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Admin</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-link" onClick={() => navigate('/admin/customer')}>
              Customer
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-link" onClick={() => navigate('/admin/customer/payment')}>
              Payments
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Manual Payment</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Record an Offline Payment</h1>
            <p className="adm-section-sub">
              Cheques, demand drafts and direct bank transfers are booked here with the bank&apos;s own reference
              and a copy of the instrument, then appear in the payment list and the receipt ledger like any online
              settlement.
            </p>
          </div>
        </div>

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/customer/payment')}
          >
            <ArrowLeft size={16} />
            <span>Back to Payments</span>
          </button>
        </div>
      </div>

      {!canRecord && (
        <div className="adm-import-guide-note" style={{ marginBottom: '16px' }}>
          <ShieldCheck size={13} style={{ color: '#b45309', marginRight: '6px', verticalAlign: '-2px' }} />
          Your role can open this page, but recording an offline payment needs create access on the Manual
          Payment module. Ask an administrator for the &quot;Manual Payment — Add&quot; permission.
        </div>
      )}

      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Payer */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Users size={18} className="adm-form-section-icon purple" />
              <span>Who paid</span>
            </div>

            {customerOptions.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-form-label">Select Customer</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={customerOptions}
                  value={customerOptions.find((o) => o.value === formState.company) || null}
                  onChange={(opt) => handleSelectCustomer(opt?.value)}
                  placeholder="Search or select a customer"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Comapny Name<span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the company name"
                  value={formState.company}
                  data-field="company"
                  onChange={(e) => setField('company')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing contact</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter contact name"
                  value={formState.customer}
                  onChange={(e) => setField('customer')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing email</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="accounts@company.in"
                  value={formState.email}
                  onChange={(e) => setField('email')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Subscription</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={contractOptions}
                  value={contractOptions.find((c) => c.value === formState.contractId) || null}
                  onChange={handleContractChange}
                  placeholder={formState.company ? 'Select the subscription paid...' : 'Pick an account first'}
                  noOptionsMessage={() => 'No subscriptions recorded for this account'}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Product / Plan paid for</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={productOptions}
                  value={
                    productOptions.find(
                      (p) =>
                        p.value === formState.productId ||
                        p.product?.productId === formState.productId ||
                        p.product?._id === formState.productId
                    ) || null
                  }
                  onChange={(opt) => setField('productId')(opt ? opt.value : '')}
                  placeholder="Select the plan this payment covers..."
                  noOptionsMessage={() => 'No products created by admin'}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Sales person</label>
                <CreatableSelect
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={staffOptions}
                  value={formState.salesPerson ? { value: formState.salesPerson, label: formState.salesPerson } : null}
                  onChange={(opt) => setField('salesPerson')(opt ? opt.value : '')}
                  onCreateOption={(text) => setField('salesPerson')(text.trim())}
                  placeholder="Pick a team member or type a name..."
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Instrument */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <Landmark size={18} className="adm-form-section-icon blue" />
              <span>How it arrived</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Payment mode <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={INSTRUMENTS}
                  value={instrument}
                  onChange={(opt) => setField('instrument')(opt?.value || 'Cheque')}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  {instrument.referenceLabel}{' '}
                  {!instrument.referenceOptional && <span className="adm-required-star">*</span>}
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="As printed by the bank"
                  value={formState.referenceNumber}
                  data-field="referenceNumber"
                  onChange={(e) => setField('referenceNumber')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Bank / branch</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="HDFC Bank — Salt Lake"
                  value={formState.bankName}
                  onChange={(e) => setField('bankName')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  {instrument.proofRequired ? 'Realisation date' : 'Value date'}
                </label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.depositDate}
                  onChange={(e) => setField('depositDate')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Received on <span className="adm-required-star">*</span>
                </label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.paymentReceivedDate}
                  data-field="paymentReceivedDate"
                  onChange={(e) => setField('paymentReceivedDate')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Settlement status <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={SETTLEMENT_STATUSES}
                  value={SETTLEMENT_STATUSES.find((s) => s.value === formState.status) || SETTLEMENT_STATUSES[0]}
                  onChange={(opt) => setField('status')(opt?.value || 'Received')}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Invoice date</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.invoiceDate}
                  onChange={(e) => setField('invoiceDate')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Invoice number (optional)</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Leave blank to take the next number from the ledger"
                  value={formState.invoiceNumber}
                  onChange={(e) => setField('invoiceNumber')(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Money */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <Banknote size={18} className="adm-form-section-icon emerald" />
              <span>Amount received</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Amount (₹) <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the amount paid"
                  value={formState.amount}
                  data-field="amount"
                  onChange={(e) => setField('amount')(e.target.value)}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">How the GST works</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={GST_BASES}
                  value={GST_BASES.find((g) => g.value === formState.gstBasis) || GST_BASES[0]}
                  onChange={(opt) => setField('gstBasis')(opt?.value || 'inclusive')}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Remarks for the reconciliation sheet</label>
                <textarea
                  className="adm-form-input"
                  rows={2}
                  placeholder="e.g. Cheque received at the front desk, deposited with the Monday bulk paying-in."
                  value={formState.notes}
                  onChange={(e) => setField('notes')(e.target.value)}
                />
              </div>
            </div>

            <div className="adm-form-preview-strip">
              <Layers size={14} />
              <span>
                Taxable <strong>{rupees(preview.taxable)}</strong>
              </span>
              <span>
                GST <strong>{rupees(preview.gst)}</strong>
              </span>
              <span>
                Booked to the ledger as <strong>{rupees(preview.gross)}</strong>
              </span>
            </div>
          </div>

          {/* Section 4: Proof */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <FileText size={18} className="adm-form-section-icon amber" />
              <span>Proof of payment</span>
            </div>

            {!proof ? (
              <div
                className={`adm-import-dropzone ${isDraggingProof ? 'is-dragging' : ''}`}
                data-field="proof"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingProof(true);
                }}
                onDragLeave={() => setIsDraggingProof(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingProof(false);
                  handleProofFile(e.dataTransfer.files && e.dataTransfer.files[0]);
                }}
                onClick={() => proofInputRef.current && proofInputRef.current.click()}
              >
                <div className="adm-import-dropzone-icon">
                  <Upload size={26} />
                </div>
                <h3 className="adm-import-dropzone-title">
                  {proofRequired ? 'Attach' : 'Optionally attach'} a scan or photo of the{' '}
                  {instrument.value.toLowerCase()}
                  {proofRequired && <span className="adm-required-star"> *</span>}
                </h3>
                <p className="adm-import-dropzone-sub">
                  {proofRequired
                    ? `A ${instrument.value.toLowerCase()} is only evidence once the paper is on file — PNG, JPG, WEBP or PDF up to 5 MB.`
                    : 'Keep a copy of the bank advice or slip against this entry — PNG, JPG, WEBP or PDF up to 5 MB.'}
                </p>
                <button
                  type="button"
                  className="adm-import-btn-browse"
                  onClick={(e) => {
                    e.stopPropagation();
                    proofInputRef.current && proofInputRef.current.click();
                  }}
                >
                  <FileUp size={15} style={{ color: '#6366f1' }} />
                  <span>Browse Document</span>
                </button>
              </div>
            ) : (
              <div className="adm-import-file-card">
                <div className="adm-import-file-details">
                  <div className="adm-import-file-icon">
                    {proof.mimeType === 'application/pdf' ? <FileText size={22} /> : <ImageIcon size={22} />}
                  </div>
                  <div className="adm-import-file-text">
                    <h4>
                      <span>{proof.fileName}</span>
                      <span className="adm-status-pill active" style={{ fontSize: '0.72rem' }}>
                        Proof attached
                      </span>
                    </h4>
                    <p>
                      {sizeLabel(proof.sizeBytes)} • {proof.mimeType}
                    </p>
                  </div>
                </div>
                <div className="adm-import-file-actions">
                  <button type="button" className="adm-import-btn-clear" onClick={() => setProof(null)}>
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={proofInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                handleProofFile(e.target.files && e.target.files[0]);
                e.target.value = '';
              }}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button type="button" className="adm-btn-secondary" onClick={() => navigate('/admin/customer/payment')}>
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting || !canRecord}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
              <span>{isSubmitting ? 'Recording...' : 'Record Offline Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
