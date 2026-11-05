import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Layers,
  Loader2,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { paymentApi } from '../../../services/paymentApi';
import { staffApi } from '../../../services/staffApi';

const PAYMENT_METHODS = [
  { value: 'NEFT / RTGS Wire', label: 'NEFT / RTGS Wire' },
  { value: 'Razorpay UPI Gateway', label: 'Razorpay UPI Gateway' },
  { value: 'Corporate NetBanking (HDFC)', label: 'Corporate NetBanking (HDFC)' },
  { value: 'Corporate Visa Card', label: 'Corporate Visa Card' },
  { value: 'Cheque Clearance', label: 'Cheque Clearance' }
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

const today = () => new Date().toISOString().slice(0, 10);

const rupees = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const amountNumber = (value) => {
  const parsed = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function CreatePaymentPage({ payments, setPayments, customers = [], contracts = [], products: catalogue = [] }) {
  const navigate = useNavigate();

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
    method: 'NEFT / RTGS Wire',
    status: 'Received',
    invoiceNumber: '',
    invoiceDate: today(),
    paymentReceivedDate: today()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: c.company || c.name,
        label: `${c.company || c.name}${c.name ? ` (${c.name})` : ''}`,
        customer: c
      })),
    [customers]
  );

  // Only the subscriptions this account actually holds, so a payment cannot be
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

  const productOptions = useMemo(
    () =>
      catalogue
        .filter((p) => p.available !== false && p.status !== 'inactive')
        .map((p) => ({ value: p.productId || p.id, label: p.name, product: p })),
    [catalogue]
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

  const handleSelectCustomer = (companyName) => {
    const matched = customers.find((c) => (c.company || c.name) === companyName);
    if (!matched) return;
    setFormState((prev) => ({
      ...prev,
      company: matched.company || matched.name || '',
      customer: matched.name || '',
      email: matched.email || matched.loginEmail || '',
      customerId: matched.customerId || '',
      // A customer rarely pays against only one term, so keep the previous pick
      // only when it still belongs to this account.
      contractId: contractOptions.some((o) => o.value === prev.contractId) ? prev.contractId : ''
    }));
  };

  const handleContractChange = (opt) => {
    const contract = opt?.contract;
    setFormState((prev) => ({
      ...prev,
      contractId: opt ? opt.value : '',
      // The contract already names the plan it was raised for.
      productId: contract?.productId || prev.productId,
      amount: prev.amount || rupees(amountNumber(contract?.totalContractValue || contract?.value))
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const company = formState.company.trim();
    if (!company || !formState.amount.trim()) {
      toast.error('Please enter the paying organization and the amount received.');
      return;
    }

    const { taxable, gst, gross } = split();
    const product = productOptions.find((p) => p.value === formState.productId)?.product;
    const contract = contractOptions.find((c) => c.value === formState.contractId)?.contract;
    const isSettled = formState.status === 'Received' || formState.status === 'Cleared';

    const items = product
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
      : [];

    const payload = {
      company,
      customer: formState.customer.trim() || company,
      email: formState.email.trim(),
      customerId: formState.customerId.trim(),
      amount: rupees(gross),
      receivedAmount: isSettled ? rupees(gross) : '₹0',
      pendingPayment: isSettled ? '₹0' : rupees(gross),
      paymentMethod: formState.method,
      status: formState.status,
      invoiceDate: formState.invoiceDate,
      paymentReceivedDate: formState.paymentReceivedDate,
      // Blank means the ledger issues the next number; typing one keeps the
      // bank's own reference when the money arrived against a known invoice.
      invoiceNumber: formState.invoiceNumber.trim(),
      contractId: formState.contractId,
      salesPerson: formState.salesPerson.trim(),
      solutionCategory: product?.name || contract?.name || company,
      taxableAmount: rupees(taxable),
      gstAmount: rupees(gst),
      gstBasis: basisLabel(),
      items
    };

    setIsSubmitting(true);
    try {
      const saved = await paymentApi.createPayment(payload);

      if (setPayments) {
        setPayments([saved, ...payments]);
      }

      toast.success(`Payment ${saved?.invoiceNumber || payload.invoiceNumber || ''} recorded.`, {
        style: { borderRadius: '12px', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' }
      });

      navigate('/admin/customer/payment');
    } catch (err) {
      console.error('[CreatePaymentPage] error:', err);
      toast.error(err.message || 'Failed to record payment.');
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
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/customer')}
            >
              Customer
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/customer/payment')}
            >
              Payments
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Record Payment</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Record Incoming Customer Payment</h1>
            <p className="adm-section-sub">
              Money received outside the portal, filed against the customer, their subscription and the
              plan sold — so it lands in the receipt list with the same detail as an online payment.
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

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Payer Details */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <Building2 size={18} className="adm-form-section-icon purple" />
              <span>Who paid</span>
            </div>

            {customers && customers.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-form-label">Pick the paying account</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={customerOptions}
                  value={customerOptions.find((o) => o.value === formState.company) || null}
                  onChange={(opt) => handleSelectCustomer(opt?.value)}
                  placeholder="Search and select paying client account..."
                  classNamePrefix="react-select"
                />
              </div>
            )}

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Paying Organization <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the company name"
                  value={formState.company}
                  onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing contact</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter contact name"
                  value={formState.customer}
                  onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Billing email</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="accounts@company.in"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
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
                  placeholder={
                    formState.company ? 'Select the subscription paid...' : 'Pick an account first'
                  }
                  noOptionsMessage={() => 'No subscriptions recorded for this account'}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Product / Plan sold</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={productOptions}
                  value={productOptions.find((p) => p.value === formState.productId) || null}
                  onChange={(opt) => setFormState({ ...formState, productId: opt ? opt.value : '' })}
                  placeholder="Select the plan this payment covers..."
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Sales person</label>
                <CreatableSelect
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={staffOptions}
                  value={
                    formState.salesPerson
                      ? { value: formState.salesPerson, label: formState.salesPerson }
                      : null
                  }
                  onChange={(opt) => setFormState({ ...formState, salesPerson: opt ? opt.value : '' })}
                  onCreateOption={(text) =>
                    setFormState({ ...formState, salesPerson: text.trim() })
                  }
                  placeholder="Pick a team member or type a name..."
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Money */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <CreditCard size={18} className="adm-form-section-icon emerald" />
              <span>Money received</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Amount (₹) <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter payment amount"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">How the GST works</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={GST_BASES}
                  value={GST_BASES.find((g) => g.value === formState.gstBasis) || GST_BASES[0]}
                  onChange={(opt) => setFormState({ ...formState, gstBasis: opt?.value || 'inclusive' })}
                  classNamePrefix="react-select"
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
                  onChange={(opt) => setFormState({ ...formState, status: opt?.value || 'Received' })}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Payment channel</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={PAYMENT_METHODS}
                  value={PAYMENT_METHODS.find((m) => m.value === formState.method) || PAYMENT_METHODS[0]}
                  onChange={(opt) => setFormState({ ...formState, method: opt?.value || 'NEFT / RTGS Wire' })}
                  classNamePrefix="react-select"
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Invoice date</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.invoiceDate}
                  onChange={(e) => setFormState({ ...formState, invoiceDate: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Received on</label>
                <input
                  type="date"
                  className="adm-form-input"
                  value={formState.paymentReceivedDate}
                  onChange={(e) => setFormState({ ...formState, paymentReceivedDate: e.target.value })}
                />
              </div>

              <div className="adm-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                <label className="adm-form-label">Invoice number (optional)</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Leave blank to take the next number from the ledger"
                  value={formState.invoiceNumber}
                  onChange={(e) => setFormState({ ...formState, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 18px',
                alignItems: 'center',
                marginTop: '16px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: '#475569'
              }}
            >
              <Layers size={14} />
              <span>Taxable <strong>{rupees(preview.taxable)}</strong></span>
              <span>GST <strong>{rupees(preview.gst)}</strong></span>
              <span>Receipt total <strong>{rupees(preview.gross)}</strong></span>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/payment')}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
              <span>{isSubmitting ? 'Recording...' : 'Log & Reconcile Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
