import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customerApi';
import { contractApi } from '../../../services/contractApi';
import { productApi } from '../../../services/productApi';
import { dashboardApi } from '../../../services/dashboardApi';
import { formatINR } from '../utils/pricingUtils';
import { useIsMobile, useIsPhone } from '../../../utils/useResponsive';
import { normalizeCustomerLifecycle } from '../../../utils/customerLifecycle';

/** Customers choose by capacity, so the brand prefix is dropped from the label. */
const stripProviderBrand = (name = '') =>
  name
    .replace(/^enterprise\s+cloud\s+server\s*[—–-]?\s*/i, '')
    .replace(/^ctrls\s+cloud\s+server\s*[—–-]?\s*/i, '')
    .replace(/^ctrls\s+/i, '')
    .trim();

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  const digits = String(value ?? '').replace(/[^0-9.]/g, '');
  return digits ? Number(digits) : NaN;
};

/** CPU / RAM / SSD can arrive as flat fields, spec rows, or a "2 core/3 GB/50 GB" string. */
const specBits = (product) => {
  const fromSpecs = (label) =>
    product.specs?.find((s) => String(s.label).toLowerCase() === label)?.value || '';
  const cores = product.cores || fromSpecs('cpu');
  const ram = product.ram || fromSpecs('ram');
  const storage = product.storage || fromSpecs('storage');
  if (cores && ram && storage) return { cores, ram, storage };

  const parts = String(product.serverConfiguration || product.userBadge || '')
    .split('/')
    .map((part) => part.trim());
  return {
    cores: cores || parts[0] || '',
    ram: ram || parts[1] || '',
    storage: storage || parts[2] || ''
  };
};

const buildPlans = (products = []) =>
  products
    .filter(
      (p) =>
        p.available !== false &&
        p.status !== 'inactive' &&
        p.provider !== 'tally' &&
        p.category !== 'ERP Solutions'
    )
    .map((p) => {
      const isDemo = Boolean(p.isDemoPlan || p.provider === 'demo' || p.category === 'Trial');
      const isCustom = Boolean(p.isCustomPlan);
      const users = Number(p.users) || toNumber(p.tier) || 1;
      const { cores, ram, storage } = specBits(p);
      const monthlyPrice = Number.isFinite(p.monthlyPrice)
        ? p.monthlyPrice
        : toNumber(p.price);

      let displayName = p.name || '';
      if (!isDemo && !isCustom) {
        displayName = stripProviderBrand(p.name) || `${users} User`;
      }

      return {
        id: p.productId || p.id || p._id,
        name: displayName,
        rawName: p.name,
        users,
        cores,
        ram,
        storage,
        monthlyPrice: Number.isFinite(monthlyPrice) ? monthlyPrice : 0,
        serverConfiguration: p.serverConfiguration || (cores && ram && storage ? `${cores}/${ram}/${storage}` : ''),
        description: p.description || '',
        isDemoPlan: isDemo,
        isCustomPlan: isCustom,
        isCustomerSpecific: Boolean(p.isCustomerSpecific),
        targetCustomerEmail: p.targetCustomerEmail || '',
        targetCustomerId: p.targetCustomerId || '',
        targetCustomerName: p.targetCustomerName || '',
        duration: p.duration || (isDemo ? '7 Days' : ''),
        badge: isDemo ? 'Trial / Demo' : isCustom ? 'Custom Plan' : ''
      };
    })
    .sort((a, b) => {
      // Demo plans first, then sorted by users and price
      if (a.isDemoPlan && !b.isDemoPlan) return -1;
      if (!a.isDemoPlan && b.isDemoPlan) return 1;
      if (a.users !== b.users) return a.users - b.users;
      return a.monthlyPrice - b.monthlyPrice;
    });

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

// The End Date field is shown as DD-MM-YYYY; everything leaving this form is
// an ISO day so the ledger and the contract dates stay sortable.
const toIsoDate = (value) => {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parts = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : '';
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

// Helper: Auto calculate end date (DD-MM-YYYY) for time-boxed Demo trials (days/weeks/months)
export const calculateDemoEndDate = (startStr, durationStr = '7 Days') => {
  if (!startStr) return '';
  const parts = startStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '';
  const [year, month, day] = parts;
  const targetDate = new Date(year, month - 1, day);

  const lower = String(durationStr || '').toLowerCase().trim();
  const match = lower.match(/^(\d+)\s*(day|week|month|year)s?/);
  if (match) {
    const count = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'day') {
      targetDate.setDate(targetDate.getDate() + count);
    } else if (unit === 'week') {
      targetDate.setDate(targetDate.getDate() + count * 7);
    } else if (unit === 'month') {
      targetDate.setMonth(targetDate.getMonth() + count);
    } else if (unit === 'year') {
      targetDate.setFullYear(targetDate.getFullYear() + count);
    }
  } else {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const y = targetDate.getFullYear();
  return `${d}-${m}-${y}`;
};

const specLine = (plan) =>
  [plan.cores, plan.ram, plan.storage].filter(Boolean).join(' · ');

/** Capacity-first plan picker: name + hardware on the left, monthly rate on the right. */
function PlanSelect({ plans, selectedId, onChange, loading, errorMessage }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const isMobile = useIsMobile();
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selected = plans.find((p) => p.id === selectedId) || null;
  const disabled = loading || plans.length === 0;

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const toggle = () => {
    if (disabled) return;
    setHighlight(Math.max(0, plans.findIndex((p) => p.id === selectedId)));
    setOpen((prev) => !prev);
  };

  const choose = (plan) => {
    onChange(plan);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        toggle();
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((i) => Math.min(i + 1, plans.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setHighlight(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setHighlight(plans.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (plans[highlight]) choose(plans[highlight]);
    }
  };

  const placeholderText = loading
    ? 'Loading plans…'
    : errorMessage || (plans.length === 0 ? 'No plans available' : 'Select a plan');

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Plan name"
        style={{
          ...inputStyle,
          height: isMobile ? 'auto' : '44px',
          minHeight: '44px',
          display: 'flex',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          alignItems: 'center',
          gap: isMobile ? '4px 10px' : '10px',
          padding: isMobile ? '8px 38px' : '0 38px 0 12px',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? '#f8fafc' : '#ffffff',
          borderColor: open ? '#4f46e5' : '#cbd5e1',
          boxShadow: open ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {selected ? (
          <>
            <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
              {selected.name}
            </span>
            {selected.badge && (
              <span
                style={{
                  fontSize: '0.72rem',
                  background: selected.isDemoPlan ? '#fef3c7' : '#e0e7ff',
                  color: selected.isDemoPlan ? '#b45309' : '#4338ca',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {selected.badge}
              </span>
            )}
            {(selected.isDemoPlan ? (selected.duration ? `Trial · ${selected.duration}` : 'Trial') : specLine(selected)) && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {selected.isDemoPlan ? `Trial · ${selected.duration}` : specLine(selected)}
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: selected.isDemoPlan ? '#059669' : '#4f46e5', whiteSpace: 'nowrap' }}>
              {selected.isDemoPlan && selected.monthlyPrice === 0 ? 'FREE' : formatINR(selected.monthlyPrice)}
              <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.78rem' }}>
                {selected.isDemoPlan ? ` (${selected.duration || 'Trial'})` : ' /mo'}
              </span>
            </span>
          </>
        ) : (
          <span style={{ color: '#94a3b8' }}>{placeholderText}</span>
        )}
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '12px',
            color: '#64748b',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
            pointerEvents: 'none'
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Available cloud plans"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 60,
            maxHeight: '320px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#64748b',
              position: 'sticky',
              top: 0
            }}
          >
            <span>Plan · Configuration</span>
            <span>Price / Term</span>
          </div>
          {plans.map((plan, index) => {
            const isSelected = plan.id === selectedId;
            return (
              <div
                key={plan.id}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => choose(plan)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : highlight === index ? '#f8fafc' : '#ffffff',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.12s ease'
                }}
              >
                <Check
                  size={15}
                  style={{
                    color: '#4f46e5',
                    opacity: isSelected ? 1 : 0,
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{plan.name}</span>
                    {plan.isDemoPlan && (
                      <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Demo</span>
                    )}
                    {plan.isCustomPlan && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: plan.isCustomerSpecific ? '#dcfce7' : '#e0e7ff',
                          color: plan.isCustomerSpecific ? '#15803d' : '#4338ca',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          border: `1px solid ${plan.isCustomerSpecific ? '#bbf7d0' : '#c7d2fe'}`
                        }}
                      >
                        {plan.isCustomerSpecific ? 'Special Custom Price' : 'Custom'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    {plan.isDemoPlan
                      ? `Demo Trial Period: ${plan.duration || '7 Days'}`
                      : plan.isCustomerSpecific
                      ? `Exclusive custom pricing for ${plan.targetCustomerName || plan.targetCustomerEmail} · ${specLine(plan) || plan.serverConfiguration || 'Private tier'}`
                      : (specLine(plan) || plan.serverConfiguration || 'Configuration as quoted')}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: plan.isDemoPlan ? '#059669' : '#4f46e5' }}>
                    {plan.isDemoPlan && plan.monthlyPrice === 0 ? 'FREE' : formatINR(plan.monthlyPrice)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {plan.isDemoPlan ? (plan.duration || 'Trial') : 'per month'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NewSubscriptionView({
  customer,
  account,
  portalData,
  isReadOnly = false,
  isDemoActive = false,
  demoExpiryDate = null,
  onBack,
  onAddToCart,
  onGoToCart
}) {
  // Current logged in customer identity
  const currentEmail = customer?.email || account?.email || 'demo@gmail.com';
  const currentName = customer?.company || customer?.name || account?.company || account?.name || 'demo';
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();

  const [customersList, setCustomersList] = useState([]);
  const [contractsList, setContractsList] = useState([]);

  // Auto-select current customer from dropdown
  const [selectedCustomer, setSelectedCustomer] = useState(currentEmail);

  // Sync selected customer whenever currentEmail changes
  useEffect(() => {
    if (currentEmail) {
      setSelectedCustomer(currentEmail);
    }
  }, [currentEmail]);

  // Load contracts ledger to accurately check historical demo trials and orders
  useEffect(() => {
    let isMounted = true;
    contractApi
      .getContracts()
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setContractsList(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-selected product: "Cloud Services" (Read only)
  const product = 'Cloud Services';

  // Live catalog from the products API (standard CtrlS, custom pricing & demo plans)
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');

  useEffect(() => {
    let isMounted = true;
    productApi
      .getProducts({ available: 'true' })
      .then((list) => {
        if (!isMounted) return;
        setPlans(buildPlans(Array.isArray(list) ? list : []));
      })
      .catch(() => {
        if (isMounted) setPlansError('Could not load plans. Please retry shortly.');
      })
      .finally(() => {
        if (isMounted) setLoadingPlans(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Identify currently selected customer record from customers list
  const activeCustomer = useMemo(() => {
    if (!selectedCustomer) return null;
    const lower = String(selectedCustomer).trim().toLowerCase();
    return (
      customersList.find(
        (c) =>
          (c.email && c.email.toLowerCase() === lower) ||
          (c.loginEmail && c.loginEmail.toLowerCase() === lower) ||
          (c.customerId && String(c.customerId).toLowerCase() === lower)
      ) || null
    );
  }, [selectedCustomer, customersList]);

  const isCurrentCustomer = useMemo(() => {
    if (!selectedCustomer) return false;
    const lower = String(selectedCustomer).trim().toLowerCase();
    return (
      Boolean(currentEmail && lower === currentEmail.toLowerCase()) ||
      Boolean(customer?.email && lower === customer.email.toLowerCase()) ||
      Boolean(account?.email && lower === account.email.toLowerCase())
    );
  }, [selectedCustomer, currentEmail, customer, account]);

  // Determine if this specific customer has already taken a demo trial once
  const isCustomerDemoUsed = useMemo(() => {
    // 1. Explicit flag on customer or portal account
    if (activeCustomer?.demoTrialUsed) return true;
    if (isCurrentCustomer && (account?.demoTrialUsed || customer?.demoTrialUsed || portalData?.account?.demoTrialUsed)) {
      return true;
    }

    // 2. Customer lifecycle stage is Demo (legacy 'demo'/'trial' words normalize to it)
    if (normalizeCustomerLifecycle(activeCustomer?.status) === 'Demo') return true;
    if (
      isCurrentCustomer &&
      [account?.status, customer?.status, portalData?.account?.status].some(
        (status) => normalizeCustomerLifecycle(status) === 'Demo'
      )
    ) {
      return true;
    }

    // 3. Customer plan string mentions demo or trial
    if (/demo|trial/i.test(activeCustomer?.plan || '')) return true;
    if (isCurrentCustomer && (/demo|trial/i.test(account?.plan || '') || /demo|trial/i.test(customer?.plan || ''))) {
      return true;
    }

    // 4. Portal data contains active or historical demo products
    if (isCurrentCustomer && Array.isArray(portalData?.demoProducts) && portalData.demoProducts.length > 0) {
      return true;
    }

    // 5. Check contracts ledger for any demo or trial contract belonging to this customer
    if (!selectedCustomer) return false;
    const lowerEmail = String(selectedCustomer).trim().toLowerCase();
    const custCompany = (
      activeCustomer?.company ||
      (isCurrentCustomer ? (account?.company || customer?.company) : '') ||
      ''
    ).trim().toLowerCase();
    const custName = (
      activeCustomer?.name ||
      (isCurrentCustomer ? (account?.name || customer?.name) : '') ||
      ''
    ).trim().toLowerCase();

    const hasMatchingDemoContract = contractsList.some((ctr) => {
      const ctrEmail = String(ctr.email || ctr.personEmail || ctr.createdBy?.email || '').trim().toLowerCase();
      const ctrCompany = String(ctr.company || ctr.accountName || ctr.customer || '').trim().toLowerCase();

      const matchesCustomer =
        (ctrEmail && ctrEmail === lowerEmail) ||
        (custCompany && ctrCompany && ctrCompany === custCompany) ||
        (custName && ctrCompany && ctrCompany === custName);

      if (!matchesCustomer) return false;

      return Boolean(
        ctr.isDemoTrial ||
        ctr.trialUsed ||
        ctr.contractType === 'Trial' ||
        ctr.productCategory === 'Trial' ||
        String(ctr.status).toUpperCase() === 'DEMO' ||
        String(ctr.status).toUpperCase() === 'CONVERTED' ||
        /demo|trial/i.test(ctr.name || ctr.service || '')
      );
    });

    if (hasMatchingDemoContract) return true;

    // 6. If customer has settled paid contracts or active paid products, initial demo is considered used
    if (activeCustomer?.orderCount > 0 || (isCurrentCustomer && ((portalData?.kpi?.activeProducts ?? 0) > 0 || (portalData?.kpi?.totalPaid ?? 0) > 0))) {
      return true;
    }

    return false;
  }, [
    activeCustomer,
    isCurrentCustomer,
    account,
    customer,
    portalData,
    selectedCustomer,
    contractsList
  ]);

  const demoExtensionAllowed = Boolean(
    activeCustomer?.demoExtensionAllowed ||
    (isCurrentCustomer && (account?.demoExtensionAllowed || portalData?.account?.demoExtensionAllowed))
  );

  const demoExtensionDays = Number(
    activeCustomer?.demoExtensionDays ||
    (isCurrentCustomer ? (account?.demoExtensionDays || portalData?.account?.demoExtensionDays) : 0) ||
    7
  );

  // Active demo trial detection for read-only order locking
  const activeDemos = portalData?.demoProducts || [];
  const activeDemo =
    activeDemos.find((d) => !d.expired && String(d.status).toUpperCase() !== 'DEMO-INACTIVE') ||
    (portalData?.products || []).find((p) =>
      Boolean(p.isDemoTrial || p.contractType === 'Trial' || p.category === 'Trial' || String(p.status).toUpperCase() === 'DEMO') &&
      !p.expired &&
      String(p.status).toUpperCase() !== 'DEMO-INACTIVE'
    ) ||
    contractsList.find((ctr) => {
      const match = (
        (ctr.customerId && (ctr.customerId === activeCustomer?.customerId || ctr.customerId === customer?.customerId)) ||
        (ctr.clientEmail && ctr.clientEmail.toLowerCase() === selectedCustomer?.toLowerCase()) ||
        (ctr.email && ctr.email.toLowerCase() === selectedCustomer?.toLowerCase())
      );
      if (!match) return false;
      const isDemo = ctr.isDemoTrial || ctr.trialUsed || ctr.contractType === 'Trial' || ctr.productCategory === 'Trial' || String(ctr.status).toUpperCase() === 'DEMO';
      if (!isDemo) return false;
      if (String(ctr.status).toUpperCase() === 'DEMO-INACTIVE' || ctr.expired) return false;
      return true;
    }) ||
    null;

  const effectiveDemoActive = Boolean(
    isDemoActive ||
    activeDemo ||
    activeCustomer?.status === 'Demo' ||
    customer?.status === 'Demo' ||
    account?.status === 'Demo' ||
    portalData?.account?.status === 'Demo' ||
    ((portalData?.kpi?.demoProducts ?? 0) > 0)
  );

  const effectiveReadOnly = Boolean(isReadOnly);
  const effectiveExpiryDate = demoExpiryDate || activeDemo?.expiryDate || activeDemo?.endDate || null;

  // If customer already used demo and has no administrator extension authorized, hide the demo plan completely
  const shouldHideDemo = Boolean((isCustomerDemoUsed || effectiveDemoActive) && !demoExtensionAllowed);

  // Filter out demo plans for customers who have already taken the demo once,
  // and ensure customer-specific custom plans are ONLY visible to that particular customer!
  const visiblePlans = useMemo(() => {
    const custEmail = (selectedCustomer || currentEmail || customer?.email || account?.email || '').trim().toLowerCase();
    const custId = (activeCustomer?.customerId || customer?.customerId || '').trim().toLowerCase();

    return plans.filter((p) => {
      // 1. Hide demo plan if already used and no extension
      if (shouldHideDemo && p.isDemoPlan) {
        return false;
      }

      // 2. Custom plan target customer filtering:
      // If a custom plan is assigned specifically to a customer, ONLY that particular customer can see it!
      if (p.isCustomPlan && (p.isCustomerSpecific || p.targetCustomerEmail || p.targetCustomerId)) {
        const planTargetEmail = (p.targetCustomerEmail || '').trim().toLowerCase();
        const planTargetId = (p.targetCustomerId || '').trim().toLowerCase();

        const matchesTarget =
          (planTargetEmail && planTargetEmail === custEmail) ||
          (planTargetId && planTargetId === custId);

        return Boolean(matchesTarget);
      }

      return true;
    });
  }, [plans, shouldHideDemo, selectedCustomer, currentEmail, customer, account, activeCustomer]);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const selectedPlan = useMemo(
    () => visiblePlans.find((p) => p.id === selectedPlanId) || null,
    [visiblePlans, selectedPlanId]
  );

  // No autofill - Plan Duration starts unselected
  const [selectedDurationKey, setSelectedDurationKey] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(getTodayDateString);

  // Reset selected plan if it is not in the visible plans list for the currently selected customer
  useEffect(() => {
    if (selectedPlanId && !visiblePlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId('');
      if (selectedDurationKey === 'demo_term') {
        setSelectedDurationKey('');
      }
    }
  }, [visiblePlans, selectedPlanId, selectedDurationKey]);

  // Reset selected plan if it was a demo plan and the selected customer has already taken the demo
  useEffect(() => {
    if (shouldHideDemo && selectedPlan?.isDemoPlan) {
      setSelectedPlanId('');
      if (selectedDurationKey === 'demo_term') {
        setSelectedDurationKey('');
      }
    }
  }, [shouldHideDemo, selectedPlan, selectedDurationKey]);

  const unitPrice = selectedPlan ? selectedPlan.monthlyPrice : '';
  const description = selectedPlan ? selectedPlan.description : '';

  const isDemoBlocked = Boolean(selectedPlan?.isDemoPlan && isCustomerDemoUsed && !demoExtensionAllowed);

  // When a demo plan is selected, auto-lock duration to demo term & set quantity to 1
  useEffect(() => {
    if (selectedPlan) {
      if (selectedPlan.isDemoPlan) {
        setSelectedDurationKey('demo_term');
        setQuantity(1);
      } else if (selectedDurationKey === 'demo_term') {
        setSelectedDurationKey('');
      }
    }
  }, [selectedPlanId]);

  const selectedDuration = useMemo(() => {
    if (selectedPlan?.isDemoPlan) {
      return {
        value: 'demo_term',
        label: `${selectedPlan.duration || '7 Days'} Trial`,
        months: 0
      };
    }
    return (
      SUBSCRIPTION_DURATIONS.find((d) => d.value === selectedDurationKey) || null
    );
  }, [selectedDurationKey, selectedPlan]);

  // Auto-calculated End Date (DD-MM-YYYY) once duration is selected
  const endDate = useMemo(() => {
    if (selectedPlan?.isDemoPlan) {
      return calculateDemoEndDate(startDate, selectedPlan.duration || '7 Days');
    }
    if (!selectedDuration) return '';
    return calculateEndDate(startDate, selectedDuration.months);
  }, [startDate, selectedDuration, selectedPlan]);

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

  // Total Amount = unitPrice * quantity * durationMonths (0 for free trial / unselected)
  const amount = useMemo(() => {
    if (selectedPlan?.isDemoPlan) {
      return Number(selectedPlan.monthlyPrice) || 0;
    }
    if (!unitPrice || !selectedDuration) return 0;
    return (
      (Number(unitPrice) || 0) *
      (Number(quantity) || 1) *
      (Number(selectedDuration.months) || 1)
    );
  }, [unitPrice, quantity, selectedDuration, selectedPlan]);

  const planLabel = selectedPlan
    ? `${selectedPlan.name}${selectedPlan.cores ? ` (${[selectedPlan.cores, selectedPlan.ram, selectedPlan.storage].filter(Boolean).join('/')})` : ''}`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select a customer from dropdown.');
      return;
    }
    if (!selectedPlan) {
      toast.error('Please select a plan from dropdown.');
      return;
    }
    if (!salesPerson) {
      setShowSalesError(true);
      toast.error('Please select a sales person before proceeding.');
      return;
    }

    // Demo Trial activation branch: immediately activates the demo in DB for the customer for the demo period
    if (selectedPlan.isDemoPlan) {
      if (shouldHideDemo || (isCustomerDemoUsed && !demoExtensionAllowed)) {
        toast.error(
          'You have already used your free demo trial once. To extend your demo trial period, please contact administrator support.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await dashboardApi.activateDemo({
          customerEmail: selectedCustomer,
          planName: selectedPlan.name,
          productId: selectedPlan.id,
          duration: selectedPlan.duration || '7 Days',
          startDate,
          endDate: toIsoDate(endDate),
          salesPerson
        });

        if (res && res.success) {
          toast.success(
            res.message ||
              `Demo trial for ${selectedPlan.name} activated successfully until ${endDate}!`
          );
          if (onBack) onBack();
        } else {
          toast.error(res?.error || res?.message || 'Failed to activate demo trial.');
        }
      } catch (err) {
        console.error('Failed to activate demo trial:', err);
        const errMsg = err.response?.data?.error || err.message || 'Failed to activate demo trial.';
        toast.error(errMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Standard / Custom order branch
    if (!selectedDurationKey || !selectedDuration) {
      toast.error('Please select a plan duration from dropdown.');
      return;
    }

    setIsSubmitting(true);

    if (onAddToCart) {
      onAddToCart({
        id: `sub-cloud-service-${Date.now()}`,
        productId: selectedPlan.id,
        name: `${product} - ${planLabel} (${selectedDuration.label})`,
        planName: planLabel,
        product,
        price: amount,
        // The line total for the whole term, before GST. The cart counts this
        // as one purchase, so the units and months live beside it, not in it.
        basePrice: amount,
        unitPrice: Number(unitPrice) || 0,
        customerEmail: selectedCustomer,
        salesPerson,
        quantity: Number(quantity) || 1,
        users: selectedPlan.users,
        serverConfiguration: selectedPlan.serverConfiguration,
        description,
        period: selectedDuration.label,
        duration: selectedDuration.label,
        durationMonths: selectedDuration.months,
        startDate,
        endDate: toIsoDate(endDate)
      });
      toast.success(`Order for ${planLabel} (${selectedDuration.label}) added to cart!`);
      if (onGoToCart) {
        onGoToCart();
      }
    } else {
      toast.success('Order configured successfully!');
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
            fontSize: isPhone ? '1.05rem' : '1.15rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            padding: isPhone ? '10px 12px' : '6px 8px',
            minHeight: isPhone ? '44px' : undefined,
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
          <span>Create Order</span>
        </button>

        {/* Fixed Back button on top-right section */}
        <button
          type="button"
          onClick={onBack}
          className="adm-back-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '999px',
            padding: '8px 18px',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
          title="Back to products"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* ── Main Form Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: isMobile ? '18px 16px' : '28px 32px'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '18px' : '22px' }}>
          {/* Row 1: Select Customer & Product */}
          <div style={{ display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '16px' : '20px' }}>
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

          {/* Single Demo Policy Alert Banner */}
          {selectedPlan?.isDemoPlan && isDemoBlocked && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#991b1b',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Single Demo Trial Policy (Trial Already Used)
                </div>
                <div style={{ marginTop: '3px', color: '#b91c1c', lineHeight: 1.4 }}>
                  Each customer account can use a demo trial once. To extend your demo trial period, an administrator must authorize additional trial days for your account. Please contact NISPL support.
                </div>
              </div>
            </div>
          )}

          {selectedPlan?.isDemoPlan && isCustomerDemoUsed && demoExtensionAllowed && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#065f46',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Trial Extension Authorized by Administrator
                </div>
                <div style={{ marginTop: '3px', color: '#047857', lineHeight: 1.4 }}>
                  An administrator has approved {demoExtensionDays} additional demo trial days for your account. Click below to apply your extension.
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Plan Name, Unit Price, Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : '2fr 1fr 1fr', gap: isMobile ? '16px' : '20px' }}>
            {/* Plan Name (live catalog, filtered dynamically per customer) */}
            <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
              <label style={labelStyle}>
                Plan Name <span style={starStyle}>*</span>
              </label>
              <PlanSelect
                plans={visiblePlans}
                selectedId={selectedPlanId}
                onChange={(plan) => setSelectedPlanId(plan.id)}
                loading={loadingPlans}
                errorMessage={plansError}
              />
              {!loadingPlans && visiblePlans.length > 0 && (
                <span style={{ display: 'block', marginTop: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {visiblePlans.length} published plans · billed per month, per configuration
                </span>
              )}
              {selectedPlan?.isCustomPlan && selectedPlan?.isCustomerSpecific && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Lock size={13} color="#15803d" />
                  <span>
                    <strong>Exclusive Custom Pricing:</strong> This special rate is exclusively configured for <strong>{selectedPlan.targetCustomerName || selectedPlan.targetCustomerEmail}</strong>.
                  </span>
                </div>
              )}
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
                value={selectedPlan?.isDemoPlan ? 1 : quantity}
                readOnly={Boolean(selectedPlan?.isDemoPlan)}
                disabled={Boolean(selectedPlan?.isDemoPlan)}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  ...inputStyle,
                  cursor: selectedPlan?.isDemoPlan ? 'not-allowed' : 'text',
                  background: selectedPlan?.isDemoPlan ? '#f8fafc' : '#ffffff'
                }}
                required
              />
            </div>
          </div>

          {/* Row 4: Amount & Description */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '1.2fr 2.8fr', gap: isMobile ? '16px' : '20px' }}>
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
                readOnly
                value={description}
                placeholder="Plan description will appear here..."
                style={{
                  ...inputStyle,
                  height: '44px',
                  paddingTop: '8px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.3',
                  cursor: description ? 'not-allowed' : 'default',
                  background: description ? '#f8fafc' : '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Section: Order Term */}
          <div style={{ marginTop: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#1e293b' }}>
              Order Term
            </h3>
          </div>

          {/* Term Row: Plan Duration, Start Date, End Date, Sales Person */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: isMobile ? '16px' : '20px'
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
                  style={{
                    ...inputStyle,
                    cursor: selectedPlan?.isDemoPlan ? 'not-allowed' : 'pointer',
                    background: selectedPlan?.isDemoPlan ? '#f8fafc' : '#ffffff'
                  }}
                  disabled={Boolean(selectedPlan?.isDemoPlan)}
                  required
                >
                  {selectedPlan?.isDemoPlan ? (
                    <option value="demo_term">
                      {selectedPlan.duration || '7 Days'} (Demo Trial)
                    </option>
                  ) : (
                    <>
                      <option value="">Select from dropdown</option>
                      {SUBSCRIPTION_DURATIONS.map((dur) => (
                        <option key={dur.value} value={dur.value}>
                          {dur.label}
                        </option>
                      ))}
                    </>
                  )}
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
              flexDirection: isPhone ? 'column' : 'row',
              justifyContent: isPhone ? 'stretch' : 'flex-start',
              gap: '12px',
              marginTop: '10px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <button
              type="submit"
              disabled={isSubmitting || plans.length === 0 || isDemoBlocked}
              style={{
                background: plans.length === 0 || isDemoBlocked ? '#cbd5e1' : '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: isPhone ? '12px 24px' : '10px 24px',
                width: isPhone ? '100%' : undefined,
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: plans.length === 0 || isDemoBlocked ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: plans.length === 0 || isDemoBlocked ? 'none' : '0 1px 2px rgba(79, 70, 229, 0.2)'
              }}
            >
              <span>
                {isSubmitting
                  ? selectedPlan?.isDemoPlan
                    ? 'Activating Demo...'
                    : 'Submitting...'
                  : isDemoBlocked
                  ? 'Demo Trial Already Used'
                  : selectedPlan?.isDemoPlan
                  ? demoExtensionAllowed
                    ? `Extend Demo Trial (+${demoExtensionDays} Days)`
                    : 'Activate Demo Trial'
                  : 'Create Order'}
              </span>
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: isPhone ? '12px 20px' : '10px 20px',
                width: isPhone ? '100%' : undefined,
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
