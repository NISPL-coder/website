import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';

// Exact CtrlS User Configuration Matrix (₹500/- per person per month)
export const CLOUD_SERVICES_PLANS = [
  {
    users: 1,
    value: 'CtrlS 1 User (2 core/3 GB/50 GB)',
    label: 'CtrlS 1 User (2 core / 3 GB / 50 GB) — ₹500/month',
    cores: '2 core',
    ram: '3 GB',
    storage: '50 GB',
    price: 500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 2 core, 3 GB RAM, 50 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 2,
    value: 'CtrlS 2 User (3 core/3 GB/50 GB)',
    label: 'CtrlS 2 User (3 core / 3 GB / 50 GB) — ₹1,000/month',
    cores: '3 core',
    ram: '3 GB',
    storage: '50 GB',
    price: 1000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 3 core, 3 GB RAM, 50 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 3,
    value: 'CtrlS 3 User (4 core/4 GB/100 GB)',
    label: 'CtrlS 3 User (4 core / 4 GB / 100 GB) — ₹1,500/month',
    cores: '4 core',
    ram: '4 GB',
    storage: '100 GB',
    price: 1500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 4 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 4,
    value: 'CtrlS 4 User (4 core/6 GB/100 GB)',
    label: 'CtrlS 4 User (4 core / 6 GB / 100 GB) — ₹2,000/month',
    cores: '4 core',
    ram: '6 GB',
    storage: '100 GB',
    price: 2000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 6 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 5,
    value: 'CtrlS 5 User (4 core/8 GB/100 GB)',
    label: 'CtrlS 5 User (4 core / 8 GB / 100 GB) — ₹2,500/month',
    cores: '4 core',
    ram: '8 GB',
    storage: '100 GB',
    price: 2500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 8 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 6,
    value: 'CtrlS 6 User (4 core/9 GB/100 GB)',
    label: 'CtrlS 6 User (4 core / 9 GB / 100 GB) — ₹3,000/month',
    cores: '4 core',
    ram: '9 GB',
    storage: '100 GB',
    price: 3000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 9 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 7,
    value: 'CtrlS 7 User (4 core/10 GB/100 GB)',
    label: 'CtrlS 7 User (4 core / 10 GB / 100 GB) — ₹3,500/month',
    cores: '4 core',
    ram: '10 GB',
    storage: '100 GB',
    price: 3500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 10 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 8,
    value: 'CtrlS 8 User (4 core/12 GB/100 GB)',
    label: 'CtrlS 8 User (4 core / 12 GB / 100 GB) — ₹4,000/month',
    cores: '4 core',
    ram: '12 GB',
    storage: '100 GB',
    price: 4000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 12 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 9,
    value: 'CtrlS 9 User (4 core/13 GB/100 GB)',
    label: 'CtrlS 9 User (4 core / 13 GB / 100 GB) — ₹4,500/month',
    cores: '4 core',
    ram: '13 GB',
    storage: '100 GB',
    price: 4500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 4 core, 13 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 10,
    value: 'CtrlS 10 User (6 core/12 GB/100 GB)',
    label: 'CtrlS 10 User (6 core / 12 GB / 100 GB) — ₹5,000/month',
    cores: '6 core',
    ram: '12 GB',
    storage: '100 GB',
    price: 5000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 6 core, 12 GB RAM, 100 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 12,
    value: 'CtrlS 12 User (8 core/16 GB/150 GB)',
    label: 'CtrlS 12 User (8 core / 16 GB / 150 GB) — ₹6,000/month',
    cores: '8 core',
    ram: '16 GB',
    storage: '150 GB',
    price: 6000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 8 core, 16 GB RAM, 150 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 15,
    value: 'CtrlS 15 User (8 core/20 GB/150 GB)',
    label: 'CtrlS 15 User (8 core / 20 GB / 150 GB) — ₹7,500/month',
    cores: '8 core',
    ram: '20 GB',
    storage: '150 GB',
    price: 7500,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 8 core, 20 GB RAM, 150 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 20,
    value: 'CtrlS 20 User (8 core/24 GB/200 GB)',
    label: 'CtrlS 20 User (8 core / 24 GB / 200 GB) — ₹10,000/month',
    cores: '8 core',
    ram: '24 GB',
    storage: '200 GB',
    price: 10000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 8 core, 24 GB RAM, 200 GB SSD, Windows Server license & daily backup.'
  },
  {
    users: 30,
    value: 'CtrlS 30 User (8 core/32 GB/300 GB)',
    label: 'CtrlS 30 User (8 core / 32 GB / 300 GB) — ₹15,000/month',
    cores: '8 core',
    ram: '32 GB',
    storage: '300 GB',
    price: 15000,
    desc: 'Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 8 core, 32 GB RAM, 300 GB SSD, Windows Server license & daily backup.'
  }
];

// Subscription Duration / Term options (1 month ... 12 months, 1 year, 2 year, 3 year)
export const SUBSCRIPTION_DURATIONS = [
  { value: '1_month', label: '1 Month', months: 1 },
  { value: '2_months', label: '2 Months', months: 2 },
  { value: '3_months', label: '3 Months', months: 3 },
  { value: '4_months', label: '4 Months', months: 4 },
  { value: '5_months', label: '5 Months', months: 5 },
  { value: '6_months', label: '6 Months', months: 6 },
  { value: '7_months', label: '7 Months', months: 7 },
  { value: '8_months', label: '8 Months', months: 8 },
  { value: '9_months', label: '9 Months', months: 9 },
  { value: '10_months', label: '10 Months', months: 10 },
  { value: '11_months', label: '11 Months', months: 11 },
  { value: '12_months', label: '12 Months', months: 12 },
  { value: '1_year', label: '1 Year', months: 12 },
  { value: '2_years', label: '2 Years', months: 24 },
  { value: '3_years', label: '3 Years', months: 36 }
];

const SALES_PERSON_OPTIONS = [
  { value: '', label: 'Select from dropdown' },
  { value: 'Nilmoni Ghosal', label: 'Nilmoni Ghosal' },
  { value: 'Sourav Mukherjee', label: 'Sourav Mukherjee' },
  { value: 'Sales Support Direct', label: 'Sales Support Direct' },
  { value: 'Online Customer Portal', label: 'Online Customer Portal' }
];

// Helper: Get today's date formatted as YYYY-MM-DD for HTML5 date input
const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper: Auto calculate end date (DD-MM-YYYY) from start date (YYYY-MM-DD) and duration (months)
const calculateEndDate = (startStr, months) => {
  if (!startStr || !months) return '';
  const parts = startStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '';
  const [year, month, day] = parts;
  const targetYear = year + Math.floor((month - 1 + Number(months)) / 12);
  const targetMonth = ((month - 1 + Number(months)) % 12 + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);
  const targetDate = new Date(targetYear, targetMonth, targetDay);
  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const y = targetDate.getFullYear();
  return `${d}-${m}-${y}`;
};

export default function NewSubscriptionView({
  customer,
  account,
  onBack,
  onAddToCart,
  onGoToCart
}) {
  // Current logged in customer identity
  const currentEmail = customer?.email || account?.email || 'demo@gmail.com';
  const currentName = customer?.company || customer?.name || account?.company || account?.name || 'demo';

  const [customersList, setCustomersList] = useState([]);
  
  // No autofill - all dropdowns default to "" ("Select from dropdown")
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Auto-selected product: "Cloud Services" (Read only)
  const product = 'Cloud Services';

  // No autofill - Plan Name starts unselected
  const [planName, setPlanName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  // No autofill - Plan Duration starts unselected
  const [selectedDurationKey, setSelectedDurationKey] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString);

  const selectedDuration = useMemo(() => {
    return (
      SUBSCRIPTION_DURATIONS.find((d) => d.value === selectedDurationKey) || null
    );
  }, [selectedDurationKey]);

  // Auto-calculated End Date (DD-MM-YYYY) once duration is selected
  const endDate = useMemo(() => {
    if (!selectedDuration) return '';
    return calculateEndDate(startDate, selectedDuration.months);
  }, [startDate, selectedDuration]);

  // Sales Person state: starts empty, error starts FALSE (no warning by default)
  const [salesPerson, setSalesPerson] = useState('');
  const [showSalesError, setShowSalesError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load registered customer list for dropdown options
  useEffect(() => {
    let isMounted = true;
    customerApi
      .getCustomers()
      .then((list) => {
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setCustomersList(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Total Amount = unitPrice * quantity * durationMonths (0 if unselected)
  const amount = useMemo(() => {
    if (!unitPrice || !selectedDuration) return 0;
    return (
      (Number(unitPrice) || 0) *
      (Number(quantity) || 1) *
      (Number(selectedDuration.months) || 1)
    );
  }, [unitPrice, quantity, selectedDuration]);

  const handlePlanChange = (selectedVal) => {
    setPlanName(selectedVal);
    const matched = CLOUD_SERVICES_PLANS.find((p) => p.value === selectedVal);
    if (matched) {
      setUnitPrice(matched.price);
      setDescription(matched.desc);
    } else {
      setUnitPrice('');
      setDescription('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select a customer from dropdown.');
      return;
    }
    if (!planName) {
      toast.error('Please select a plan from dropdown.');
      return;
    }
    if (!selectedDurationKey || !selectedDuration) {
      toast.error('Please select a plan duration from dropdown.');
      return;
    }
    if (!salesPerson) {
      setShowSalesError(true);
      toast.error('Please select a sales person before proceeding.');
      return;
    }

    setIsSubmitting(true);

    if (onAddToCart) {
      onAddToCart({
        id: `sub-cloud-service-${Date.now()}`,
        name: `${product} - ${planName} (${selectedDuration.label})`,
        planName,
        product,
        price: amount,
        basePrice: amount,
        customerEmail: selectedCustomer,
        salesPerson,
        quantity: Number(quantity) || 1,
        period: selectedDuration.label,
        duration: selectedDuration.label,
        durationMonths: selectedDuration.months,
        startDate,
        endDate
      });
      toast.success(`Subscription for ${planName} (${selectedDuration.label}) added to cart!`);
      if (onGoToCart) {
        onGoToCart();
      }
    } else {
      toast.success('Subscription configured successfully!');
      if (onBack) onBack();
    }
  };

  return (
    <div className="new-subscription-page animate-fade-in" style={{ padding: '4px 0 24px' }}>
      {/* ── Top Header Bar with Back Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#4f46e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#0f172a';
          }}
        >
          <ArrowLeft size={19} />
          <span>New Subscription</span>
        </button>
      </div>

      {/* ── Main Form Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '28px 32px'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Row 1: Select Customer & Product */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Select Customer (No autofill) */}
            <div>
              <label style={labelStyle}>
                Select Customer <span style={starStyle}>*</span>
              </label>
              <div style={selectWrapStyle}>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select from dropdown</option>
                  <option value={currentEmail}>
                    {currentEmail} {currentName ? `(${currentName})` : ''}
                  </option>
                  {customersList
                    .filter((c) => c.email && c.email.toLowerCase() !== currentEmail.toLowerCase())
                    .map((c) => (
                      <option key={c.customerId || c.email} value={c.email}>
                        {c.email} ({c.company || c.name || 'Customer'})
                      </option>
                    ))}
                </select>
                <ChevronDown size={16} style={chevronStyle} />
              </div>
            </div>

            {/* Product (Auto select: "Cloud Services" - Read only) */}
            <div>
              <label style={labelStyle}>
                Product <span style={starStyle}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={product}
                  readOnly
                  aria-label="Product"
                  style={{
                    ...inputStyle,
                    background: '#f8fafc',
                    color: '#1e293b',
                    fontWeight: 600,
                    cursor: 'not-allowed',
                    paddingRight: '36px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Plan Header */}
          <div style={{ marginTop: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#1e293b' }}>Plan</h3>
          </div>

          {/* Row 3: Plan Name, Unit Price, Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
            {/* Plan Name (No autofill) */}
            <div>
              <label style={labelStyle}>
                Plan Name <span style={starStyle}>*</span>
              </label>
              <div style={selectWrapStyle}>
                <select
                  value={planName}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select from dropdown</option>
                  {CLOUD_SERVICES_PLANS.map((pl) => (
                    <option key={pl.value} value={pl.value}>
                      {pl.value}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={chevronStyle} />
              </div>
            </div>

            {/* Unit Price (Auto populated based on selected plan - Read only) */}
            <div>
              <label style={labelStyle}>
                Unit Price <span style={starStyle}>*</span>
              </label>
              <input
                type="text"
                readOnly
                value={unitPrice ? unitPrice : ''}
                
                style={{
                  ...inputStyle,
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Quantity */}
            <div>
              <label style={labelStyle}>
                Quantity <span style={starStyle}>*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Row 4: Amount & Description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: '20px' }}>
            {/* Amount (Unit Price * Quantity * Duration) */}
            <div>
              <label style={labelStyle}>Amount</label>
              <input
                type="text"
                readOnly
                value={amount ? amount : 0}
                style={{ ...inputStyle, background: '#f8fafc', color: '#1e293b', fontWeight: 600 }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Plan description will appear here..."
                style={{
                  ...inputStyle,
                  height: '40px',
                  paddingTop: '8px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.3'
                }}
              />
            </div>
          </div>

          {/* Section: Subscription Term */}
          <div style={{ marginTop: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#1e293b' }}>
              Subscription Term
            </h3>
          </div>

          {/* Term Row: Plan Duration, Start Date, End Date, Sales Person */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Plan Duration / Term (No autofill) */}
            <div>
              <label style={labelStyle}>
                Plan Duration <span style={starStyle}>*</span>
              </label>
              <div style={selectWrapStyle}>
                <select
                  value={selectedDurationKey}
                  onChange={(e) => setSelectedDurationKey(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select from dropdown</option>
                  {SUBSCRIPTION_DURATIONS.map((dur) => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={chevronStyle} />
              </div>
            </div>

            {/* Start Date (Editable) */}
            <div>
              <label style={labelStyle}>
                Start Date <span style={starStyle}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer'
                }}
                required
              />
            </div>

            {/* End Date (Auto calculated based on Duration & Start Date) */}
            <div>
              <label
                style={{
                  ...labelStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  End Date <span style={starStyle}>*</span>
                </span>
                {endDate && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#4f46e5',
                      background: '#eef2ff',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    Auto
                  </span>
                )}
              </label>
              <input
                type="text"
                readOnly
                value={endDate}
                style={{
                  ...inputStyle,
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Sales Person (No warning by default, starts on Select from dropdown) */}
            <div>
              <label style={labelStyle}>
                Sales Person <span style={starStyle}>*</span>
              </label>
              <div style={selectWrapStyle}>
                <select
                  value={salesPerson}
                  onChange={(e) => {
                    setSalesPerson(e.target.value);
                    if (e.target.value) setShowSalesError(false);
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: showSalesError && !salesPerson ? '#ef4444' : '#cbd5e1'
                  }}
                  required
                >
                  {SALES_PERSON_OPTIONS.map((sp) => (
                    <option key={sp.value} value={sp.value}>
                      {sp.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={chevronStyle} />
              </div>
              {showSalesError && !salesPerson && (
                <span
                  style={{
                    display: 'block',
                    marginTop: '5px',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    fontWeight: 500
                  }}
                >
                  Sales Person is required
                </span>
              )}
            </div>
          </div>

          {/* Actions: Submit Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '12px',
              marginTop: '10px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 24px',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
              }}
            >
              <span>Subscribe Now</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '0.92rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#334155',
  marginBottom: '6px'
};

const starStyle = {
  color: '#ef4444',
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  height: '40px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  background: '#ffffff',
  padding: '0 12px',
  fontSize: '0.9rem',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none'
};

const selectWrapStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const chevronStyle = {
  position: 'absolute',
  right: '12px',
  pointerEvents: 'none',
  color: '#64748b'
};
