import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Calendar, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  UserPlus,
  Server,
  Receipt,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  X,
  Check,
  Users,
  Briefcase,
  Smartphone,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';
import {
  TallySingleLogo,
  TallyMultiLogo,
  TallyAuditorLogo,
  BizAnalystLogo,
  WhatsAppLogo,
  TallyPrimeLogo,
  TallyUpgradeLogo
} from '../SubscriptionLogos';
import '../LoginPage.css';
import './CustomerRegister.css';

export const SUBSCRIPTION_GROUPS = [
  {
    groupId: 'tss-single',
    groupName: 'Tally Software Service (TSS) — Single User',
    shortName: 'TSS Single User',
    description: 'Statutory updates, auto bank reconciliation, remote access & Tally support for Single User.',
    badgeText: '10% OFF on 2 Years',
    badgeType: 'discount',
    LogoComponent: TallySingleLogo,
    isTableLayout: true,
    options: [
      {
        id: 'tss-single-1yr',
        groupId: 'tss-single',
        name: 'Tally Software Service (TSS) [Single User]',
        subName: '1 Year Renewal',
        duration: '1 Year',
        durationYears: 1,
        type: 'Annual Subscription',
        basePrice: 4500,
        discountRate: 0.00, // No discount on 1-year
        hasExpiry: true
      },
      {
        id: 'tss-single-2yr',
        groupId: 'tss-single',
        name: 'Tally Software Service (TSS) [Single User]',
        subName: '2 Years Renewal',
        duration: '2 Years',
        durationYears: 2,
        type: 'Biennial Subscription',
        basePrice: 9000,
        discountRate: 0.10, // 10% discount
        hasExpiry: true
      }
    ]
  },
  {
    groupId: 'tss-multi',
    groupName: 'Tally Software Service (TSS) — Multi User',
    shortName: 'TSS Multi User',
    description: 'Multi-user concurrency, remote sync, banking and statutory updates across unlimited LAN.',
    badgeText: '10% OFF on 2 Years',
    badgeType: 'discount',
    LogoComponent: TallyMultiLogo,
    isTableLayout: true,
    options: [
      {
        id: 'tss-multi-1yr',
        groupId: 'tss-multi',
        name: 'Tally Software Service (TSS) [Multi User]',
        subName: '1 Year Renewal',
        duration: '1 Year',
        durationYears: 1,
        type: 'Annual Subscription',
        basePrice: 13500,
        discountRate: 0.00, // No discount on 1-year
        hasExpiry: true
      },
      {
        id: 'tss-multi-2yr',
        groupId: 'tss-multi',
        name: 'Tally Software Service (TSS) [Multi User]',
        subName: '2 Years Renewal (Discounted: ₹24,300 + tax)',
        duration: '2 Years',
        durationYears: 2,
        type: 'Biennial Subscription',
        basePrice: 27000,
        discountRate: 0.10, // 10% discount -> 24300
        hasExpiry: true
      }
    ]
  },
  {
    groupId: 'tss-auditors',
    groupName: 'Tally Software Service (TSS) — Auditors (Multi User)',
    shortName: 'TSS Auditors',
    description: 'Special statutory audit edition for Chartered Accountants with multi-user audit tools.',
    badgeText: '10% OFF on 2 Years',
    badgeType: 'discount',
    LogoComponent: TallyAuditorLogo,
    isTableLayout: true,
    options: [
      {
        id: 'tss-auditor-1yr',
        groupId: 'tss-auditors',
        name: 'TSS for Auditors (Multi User)',
        subName: '1 Year Renewal',
        duration: '1 Year',
        durationYears: 1,
        type: 'Annual Subscription',
        basePrice: 6750,
        discountRate: 0.00, // No discount on 1-year
        hasExpiry: true
      },
      {
        id: 'tss-auditor-2yr',
        groupId: 'tss-auditors',
        name: 'TSS for Auditors (Multi User)',
        subName: '2 Years Renewal',
        duration: '2 Years',
        durationYears: 2,
        type: 'Biennial Subscription',
        basePrice: 13500,
        discountRate: 0.10, // 10% discount -> 12150
        hasExpiry: true
      }
    ]
  },
  {
    groupId: 'biz-analyst',
    groupName: 'Tally on Mobile — Biz Analyst',
    shortName: 'Biz Analyst Mobile',
    description: 'Access real-time Tally sales, inventory, outstanding ledgers & reports on mobile (Android/iOS).',
    badgeText: 'Up to 2 Years Free',
    badgeType: 'discount',
    LogoComponent: BizAnalystLogo,
    isTableLayout: false,
    options: [
      {
        id: 'biz-1yr',
        groupId: 'biz-analyst',
        name: 'Tally on Mobile — Biz Analyst',
        subName: '1 Year Plan (Single User)',
        duration: '1 Year',
        durationYears: 1,
        type: 'Single User',
        basePrice: 3300,
        discountRate: 0.00,
        hasExpiry: true
      },
      {
        id: 'biz-3yr',
        groupId: 'biz-analyst',
        name: 'Tally on Mobile — Biz Analyst',
        subName: '3 Years (2 Years + 1 Year Free)',
        duration: '3 Years (2 Yrs + 1 Yr Free)',
        durationYears: 3,
        type: 'Single User',
        offerBadge: '1 Year Free',
        basePrice: 6600,
        discountRate: 0.00,
        hasExpiry: true
      },
      {
        id: 'biz-5yr',
        groupId: 'biz-analyst',
        name: 'Tally on Mobile — Biz Analyst',
        subName: '5 Years (3 Years + 2 Years Free)',
        duration: '5 Years (3 Yrs + 2 Yrs Free)',
        durationYears: 5,
        type: 'Single User',
        offerBadge: '2 Years Free',
        basePrice: 9900,
        discountRate: 0.00,
        hasExpiry: true
      }
    ]
  },
  {
    groupId: 'whatsapp',
    groupName: 'Tally from WhatsApp',
    shortName: 'WhatsApp Add-on',
    description: 'Instant automated delivery of invoices, ledgers, and payment reminders via official WhatsApp API.',
    badgeText: 'Official Meta Cloud API',
    badgeType: 'neutral',
    LogoComponent: WhatsAppLogo,
    isTableLayout: false,
    options: [
      {
        id: 'wa-renewal',
        groupId: 'whatsapp',
        name: 'Tally from WhatsApp — Renewal',
        subName: 'Annual Service Renewal',
        duration: '1 Year',
        durationYears: 1,
        type: 'Renewal',
        balanceValue: null,
        basePrice: 1300,
        discountRate: 0.00,
        hasExpiry: true
      },
      {
        id: 'wa-topup-575',
        groupId: 'whatsapp',
        name: 'Tally from WhatsApp — Top-up',
        subName: 'Prepaid Message Credit (Balance value: ₹575)',
        duration: 'Usage Based',
        durationYears: 0,
        type: 'Top-up',
        balanceValue: 575,
        basePrice: 675,
        discountRate: 0.00,
        hasExpiry: false
      },
      {
        id: 'wa-topup-2000',
        groupId: 'whatsapp',
        name: 'Tally from WhatsApp — Top-up',
        subName: 'High Volume Credit (Balance value: ₹2,000)',
        duration: 'Usage Based',
        durationYears: 0,
        type: 'Top-up',
        balanceValue: 2000,
        basePrice: 2700,
        discountRate: 0.00,
        hasExpiry: false
      }
    ]
  },
  {
    groupId: 'tallyprime',
    groupName: 'TallyPrime',
    shortName: 'TallyPrime License',
    description: 'Complete ERP & accounting suite for GST compliance, multi-location inventory & reporting.',
    badgeText: 'Perpetual Lifetime License',
    badgeType: 'neutral',
    LogoComponent: TallyPrimeLogo,
    isTableLayout: false,
    options: [
      {
        id: 'tp-single',
        groupId: 'tallyprime',
        name: 'TallyPrime (Silver) — Single User',
        subName: 'Standalone Desktop License (Perpetual)',
        duration: 'Lifetime',
        durationYears: 0,
        type: 'Single User',
        basePrice: 22500,
        discountRate: 0.00,
        hasExpiry: false
      },
      {
        id: 'tp-multi',
        groupId: 'tallyprime',
        name: 'TallyPrime (Gold) — Multi User',
        subName: 'Network Unlimited LAN License (Perpetual)',
        duration: 'Lifetime',
        durationYears: 0,
        type: 'Multi User',
        basePrice: 67500,
        discountRate: 0.00,
        hasExpiry: false
      }
    ]
  },
  {
    groupId: 'upgrade',
    groupName: 'Single User to Multi User Upgrade',
    shortName: 'Silver to Gold Upgrade',
    description: 'Upgrade existing TallyPrime Single User license to Multi User Gold edition across LAN.',
    badgeText: 'License Upgrade',
    badgeType: 'neutral',
    LogoComponent: TallyUpgradeLogo,
    isTableLayout: false,
    options: [
      {
        id: 'upgrade-single-to-multi',
        groupId: 'upgrade',
        name: 'Single User to Multi User Upgrade',
        subName: 'TallyPrime Silver to Gold Edition',
        duration: 'Lifetime',
        durationYears: 0,
        type: 'Upgrade',
        basePrice: 45000,
        discountRate: 0.00,
        hasExpiry: false
      }
    ]
  }
];

const ALL_PLAN_OPTIONS = SUBSCRIPTION_GROUPS.flatMap((g) => g.options);

export function calculatePlanPricing(planOption, customDiscountRate = null) {
  if (!planOption) return null;
  const basePrice = Number(planOption.basePrice) || 0;
  const discountRate = customDiscountRate !== null 
    ? Number(customDiscountRate) 
    : (Number(planOption.discountRate) || 0);

  // Decimal-safe in paise or rounded to 2 decimal places
  const discountAmount = Math.round(basePrice * discountRate * 100) / 100;
  const discountedPrice = Math.round((basePrice - discountAmount) * 100) / 100;
  const gstAmount = Math.round(discountedPrice * 0.18 * 100) / 100;
  const totalPayable = Math.round((discountedPrice + gstAmount) * 100) / 100;

  return {
    basePrice,
    discountRate,
    discountPercent: Math.round(discountRate * 100),
    discountAmount,
    discountedPrice,
    gstRate: 0.18,
    gstPercent: 18,
    gstAmount,
    totalPayable
  };
}

export function formatINR(val) {
  if (typeof val !== 'number' || isNaN(val)) return '₹0.00';
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function toDateInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatReadableDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  // Multi-step Wizard: 1 = Customer Details, 2 = Subscription Details
  const [currentStep, setCurrentStep] = useState(1);

  // Section 1: Customer Details
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    mobile: '',
    companyName: '',
    companyLogo: '',
    gstNo: ''
  });

  // Section 2: Selected Plan Option (Default: TSS Single User 1-Year)
  const [selectedPlanId, setSelectedPlanId] = useState('tss-single-1yr');

  // Accordion open/collapse states (TSS Single User open by default, all expandable)
  const [expandedGroups, setExpandedGroups] = useState({
    'tss-single': true,
    'tss-multi': false,
    'tss-auditors': false,
    'biz-analyst': false,
    whatsapp: false,
    tallyprime: false,
    upgrade: false
  });

  // Section 2: Installation Date & Billing
  const [installationDate, setInstallationDate] = useState(() => toDateInputValue(new Date()));
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [registeredData, setRegisteredData] = useState(null);

  // Find currently selected plan option
  const activePlan = useMemo(() => {
    return ALL_PLAN_OPTIONS.find((p) => p.id === selectedPlanId) || ALL_PLAN_OPTIONS[0];
  }, [selectedPlanId]);

  // Centralized price calculation for the selected plan
  const priceDetails = useMemo(() => {
    return calculatePlanPricing(activePlan);
  }, [activePlan]);

  // Calculate Expiry Date based on active plan and installation date
  const calculatedExpiryDate = useMemo(() => {
    if (!activePlan || !activePlan.hasExpiry || !installationDate) {
      return null;
    }
    try {
      const installD = new Date(installationDate);
      if (isNaN(installD.getTime())) return null;
      const expiry = new Date(installD);
      expiry.setFullYear(expiry.getFullYear() + Number(activePlan.durationYears || 1));
      return toDateInputValue(expiry);
    } catch {
      return null;
    }
  }, [activePlan, installationDate]);

  // Accordion toggle handler (preserves selectedPlanId)
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Option selection handler (auto-expands parent group if not already)
  const handleSelectOption = (option) => {
    setSelectedPlanId(option.id);
    setExpandedGroups((prev) => ({
      ...prev,
      [option.groupId]: true
    }));
    setValidationError('');
  };

  const handleCustomerChange = (field, value) => {
    setCustomerDetails((prev) => ({
      ...prev,
      [field]: value
    }));
    setValidationError('');
  };

  const handleSetToday = () => {
    setInstallationDate(toDateInputValue(new Date()));
  };

  const handleSetTomorrow = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setInstallationDate(toDateInputValue(tmrw));
  };

  // Step 1 -> Step 2 validation transition
  const handleContinueToSection2 = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!customerDetails.name.trim()) {
      setValidationError('Please enter customer full name.');
      return;
    }
    if (!customerDetails.email.trim()) {
      setValidationError('Please enter corporate email.');
      return;
    }
    if (!customerDetails.mobile.trim()) {
      setValidationError('Please enter contact mobile number.');
      return;
    }
    if (!customerDetails.companyName.trim()) {
      setValidationError('Please enter company / firm name.');
      return;
    }
    if (!customerDetails.gstNo.trim()) {
      setValidationError('Please enter 15-digit GSTIN.');
      return;
    }

    // Scroll to top and transition to Step 2
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(2);
  };

  // Step 2 Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!installationDate) {
      setValidationError('Please select or specify the installation date.');
      return;
    }
    if (!agreeTerms) {
      setValidationError('Please accept the NISPL Cloud terms and enterprise SLA.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      setRegisteredData({
        customerId: `NIS-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
        ...customerDetails,
        planName: activePlan.name,
        planDuration: activePlan.duration,
        planType: activePlan.type,
        pricing: priceDetails,
        installationDate,
        expiryDate: calculatedExpiryDate
      });
    }, 750);
  };

  return (
    <div className="ebolt-login-viewport">
      {/* Top Bar: Official Brand Logo & Back to Login */}
      <header className="ebolt-top-nav">
        <Link to="/" className="ebolt-brand-link" title="Net Infotech System Pvt. Ltd. Concept to Reality">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="ebolt-brand-logo-img" 
            height="48"
          />
        </Link>

        <Link to="/customer-login" className="ebolt-home-pill-btn">
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Container: Adapts dynamically from compact Step 1 to expansive Step 2 */}
      <main className={`cust-reg-container ${currentStep === 1 ? 'step-1-compact' : ''}`}>
        <div className="cust-reg-card animate-fade-in">

          {/* Top-Right Back Button to Step 1 */}
          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentStep(1);
              }}
              className="ebolt-top-right-back-btn"
              title="Return to Customer Details"
            >
              <ArrowLeft size={14} />
              <span>Back to Details</span>
            </button>
          )}

          {/* Top Floating Badge Icon */}
          <div className="ebolt-badge-icon-box" aria-hidden="true">
            <UserPlus size={22} color="#0284c7" />
          </div>

          {/* Main Headings */}
          <div className="ebolt-reg-header-center">
            <h1 className="ebolt-card-title">Create Customer Account</h1>
            <p className="ebolt-card-subtitle">
              {currentStep === 1 
                ? 'Step 1 of 2: Enter your entity credentials and authorized contact details.'
                : 'Step 2 of 2: Configure your subscription, installation date and billing duration.'}
            </p>
          </div>

          {/* Two-step Progress Stepper */}
          <div className="ebolt-stepper-track" style={{ marginBottom: '22px' }}>
            <button
              type="button"
              className={`ebolt-step-node ${currentStep === 1 ? 'active' : 'completed'}`}
              onClick={() => setCurrentStep(1)}
              title="Step 1: Customer Details"
            >
              <span className="ebolt-step-bubble">
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span>Customer Details</span>
            </button>

            <div className={`ebolt-step-line ${currentStep > 1 ? 'filled' : ''}`} />

            <button
              type="button"
              className={`ebolt-step-node ${currentStep === 2 ? 'active' : ''}`}
              onClick={() => {
                if (customerDetails.name && customerDetails.email && customerDetails.companyName) {
                  setCurrentStep(2);
                }
              }}
              title="Step 2: Subscription Details"
            >
              <span className="ebolt-step-bubble">2</span>
              <span>Subscription Details</span>
            </button>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="ebolt-alert-error" role="alert" style={{ marginBottom: '18px' }}>
              <span>{validationError}</span>
            </div>
          )}

          {/* =================================================================
              STEP 1: CUSTOMER DETAILS (Preserved exactly with inline asterisks)
              ================================================================= */}
          {currentStep === 1 && (
            <div className="ebolt-step-container">
              <div className="ebolt-section-heading">
                <span>Customer Details</span>
              </div>

              <form onSubmit={handleContinueToSection2} className="ebolt-form" style={{ marginTop: '16px' }}>
                <div className="ebolt-form-grid-2">
                  {/* 1. Name */}
                  <div className="ebolt-field-group">
                    <label className="ebolt-field-lbl" htmlFor="reg-name">
                      <span>Name</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="ebolt-input-wrap">
                      <User size={16} className="ebolt-input-icon" />
                      <input
                        id="reg-name"
                        type="text"
                        className="ebolt-input"
                        placeholder="Enter Name"
                        value={customerDetails.name}
                        onChange={(e) => handleCustomerChange('name', e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div className="ebolt-field-group">
                    <label className="ebolt-field-lbl" htmlFor="reg-email">
                      <span>Email</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="ebolt-input-wrap">
                      <Mail size={16} className="ebolt-input-icon" />
                      <input
                        id="reg-email"
                        type="email"
                        className="ebolt-input"
                        placeholder="Enter Email"
                        value={customerDetails.email}
                        onChange={(e) => handleCustomerChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 3. Mobile */}
                  <div className="ebolt-field-group">
                    <label className="ebolt-field-lbl" htmlFor="reg-mobile">
                      <span>Mobile</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="ebolt-input-wrap">
                      <Phone size={16} className="ebolt-input-icon" />
                      <input
                        id="reg-mobile"
                        type="tel"
                        className="ebolt-input"
                        placeholder="Enter Mobile Number"
                        value={customerDetails.mobile}
                        onChange={(e) => handleCustomerChange('mobile', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 4. Company Name */}
                  <div className="ebolt-field-group">
                    <label className="ebolt-field-lbl" htmlFor="reg-company">
                      <span>Company name</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="ebolt-input-wrap">
                      <Building2 size={16} className="ebolt-input-icon" />
                      <input
                        id="reg-company"
                        type="text"
                        className="ebolt-input"
                        placeholder="Company / Enterprise Name"
                        value={customerDetails.companyName}
                        onChange={(e) => handleCustomerChange('companyName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 5. GST No */}
                  <div className="ebolt-field-group">
                    <label className="ebolt-field-lbl" htmlFor="reg-gst">
                      <span>GST No</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="ebolt-input-wrap">
                      <FileText size={16} className="ebolt-input-icon" />
                      <input
                        id="reg-gst"
                        type="text"
                        className="ebolt-input"
                        placeholder="15-digit GSTIN (e.g. 19AAAAA0000A1Z5)"
                        value={customerDetails.gstNo}
                        onChange={(e) => handleCustomerChange('gstNo', e.target.value.toUpperCase())}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  {/* 6. Company Logo (non mandatory) */}
                  <div className="ebolt-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="ebolt-field-lbl" htmlFor="reg-logo">
                        <span>Company logo</span>
                      </label>
                      {customerDetails.companyLogo && (
                        <button
                          type="button"
                          onClick={() => handleCustomerChange('companyLogo', '')}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                          title="Remove logo"
                        >
                          <X size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="ebolt-input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      {customerDetails.companyLogo ? (
                        <img
                          src={customerDetails.companyLogo}
                          alt="Logo preview"
                          style={{ width: '22px', height: '22px', objectFit: 'contain', marginLeft: '12px', borderRadius: '4px' }}
                        />
                      ) : (
                        <ImageIcon size={16} className="ebolt-input-icon" />
                      )}
                      <input
                        id="reg-logo"
                        type="text"
                        className="ebolt-input"
                        placeholder="Logo URL or click Upload"
                        value={customerDetails.companyLogo}
                        onChange={(e) => handleCustomerChange('companyLogo', e.target.value)}
                        style={{ paddingRight: '82px' }}
                        autoComplete="off"
                      />
                      <label
                        htmlFor="reg-logo-file-alt"
                        style={{
                          position: 'absolute',
                          right: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Upload image from device"
                      >
                        <Upload size={12} />
                        <span>Upload</span>
                      </label>
                      <input
                        id="reg-logo-file-alt"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Logo file size must be less than 2MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleCustomerChange('companyLogo', reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Continue to Section 2 Button */}
                <button
                  type="submit"
                  className="ebolt-submit-btn"
                  style={{ marginTop: '20px' }}
                >
                  <span>Continue to Subscription Details</span>
                  <ArrowRight size={16} />
                </button>

                {/* Bottom link to Sign In */}
                <div className="ebolt-create-account-box">
                  <span className="ebolt-create-account-text">Already registered? </span>
                  <Link to="/customer-login" className="ebolt-create-account-link">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================
              STEP 2: SUBSCRIPTION DETAILS (Two-Column Layout: Left ~68%, Right ~32%)
              ================================================================= */}
          {currentStep === 2 && (
            <div className="cust-reg-grid">

              {/* -------------------------------------------------------------
                  LEFT COLUMN: SUBSCRIPTION DETAILS (68%)
                  ------------------------------------------------------------- */}
              <div className="cust-reg-left-col">

                {/* 1. SELECT PLAN */}
                <section aria-labelledby="section-select-plan">
                  <div className="cust-section-title-box">
                    <div className="cust-section-num-bubble">1</div>
                    <div>
                      <h2 id="section-select-plan" className="cust-section-title">Select Plan</h2>
                      <p className="cust-section-subtitle">Choose from verified Tally licenses, renewals, and WhatsApp add-ons</p>
                    </div>
                  </div>

                  {/* 4 Expandable Plan Groups */}
                  <div className="cust-plan-groups-list">
                    {SUBSCRIPTION_GROUPS.map((group) => {
                      const LogoComp = group.LogoComponent;
                      const isExpanded = Boolean(expandedGroups[group.groupId]);
                      const hasSelectedChild = group.options.some((o) => o.id === selectedPlanId);

                      return (
                        <div 
                          key={group.groupId} 
                          className={`cust-plan-group-accordion ${hasSelectedChild ? 'has-selected-item' : ''} ${isExpanded ? 'is-expanded' : ''}`}
                        >
                          {/* Accordion Header */}
                          <button
                            type="button"
                            className="cust-accordion-header"
                            onClick={() => toggleGroup(group.groupId)}
                            aria-expanded={isExpanded}
                          >
                            <div className="cust-accordion-header-left">
                              <div className="cust-accordion-icon-box">
                                {LogoComp && <LogoComp />}
                              </div>
                              <div className="cust-accordion-titles">
                                <div className="cust-accordion-title-row">
                                  <span className="cust-accordion-title">{group.groupName}</span>
                                  {group.badgeType === 'discount' ? (
                                    <span className="cust-badge-discount">
                                      {group.badgeText}
                                    </span>
                                  ) : (
                                    <span className="cust-badge-neutral">
                                      {group.badgeText}
                                    </span>
                                  )}
                                </div>
                                <span className="cust-accordion-desc">{group.description}</span>
                              </div>
                            </div>

                            <div className="cust-accordion-header-right">
                              {hasSelectedChild && (
                                <span className="cust-selected-pill">
                                  <Check size={12} strokeWidth={3} />
                                  <span>Selected</span>
                                </span>
                              )}
                              <ChevronDown 
                                size={18} 
                                className={`cust-chevron-icon ${isExpanded ? 'rotate' : ''}`} 
                              />
                            </div>
                          </button>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <div className="cust-accordion-body animate-fade-in">
                              
                              {/* Group 1: TSS Table Layout (Desktop) & Clean Responsive Cards (Mobile) */}
                              {group.isTableLayout ? (
                                <>
                                  {/* Desktop Table View */}
                                  <div className="cust-tss-table-wrap cust-desktop-table-view">
                                    <table className="cust-tss-table">
                                      <thead>
                                        <tr>
                                          <th>Plan / Duration</th>
                                          <th>Base Price</th>
                                          <th>Discount</th>
                                          <th>Discounted Price</th>
                                          <th>GST (18%)</th>
                                          <th>Total Payable</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {group.options.map((opt) => {
                                          const calc = calculatePlanPricing(opt);
                                          const isSelected = opt.id === selectedPlanId;

                                          return (
                                            <tr
                                              key={opt.id}
                                              className={isSelected ? 'is-selected-row' : ''}
                                              onClick={() => handleSelectOption(opt)}
                                            >
                                              <td>
                                                <div className="cust-radio-cell">
                                                  <input
                                                    type="radio"
                                                    name="subscription_plan"
                                                    className="cust-radio-input"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOption(opt)}
                                                  />
                                                  <span>{opt.duration}</span>
                                                </div>
                                              </td>
                                              <td>{formatINR(calc.basePrice)}</td>
                                              <td>
                                                {calc.discountPercent > 0 ? (
                                                  <span className="cust-discount-tag">
                                                    {calc.discountPercent}% OFF (−{formatINR(calc.discountAmount)})
                                                  </span>
                                                ) : (
                                                  <span style={{ color: '#94a3b8' }}>—</span>
                                                )}
                                              </td>
                                              <td>
                                                {calc.discountPercent > 0 ? (
                                                  formatINR(calc.discountedPrice)
                                                ) : (
                                                  <span style={{ color: '#94a3b8' }}>—</span>
                                                )}
                                              </td>
                                              <td>{formatINR(calc.gstAmount)}</td>
                                              <td>
                                                <span className="cust-final-val">{formatINR(calc.totalPayable)}</span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Mobile Card View (Polished Enterprise UI) */}
                                  <div className="cust-mobile-cards-list cust-mobile-cards-view">
                                    {group.options.map((opt) => {
                                      const calc = calculatePlanPricing(opt);
                                      const isSelected = opt.id === selectedPlanId;

                                      return (
                                        <div
                                          key={opt.id}
                                          className={`cust-mobile-plan-card ${isSelected ? 'is-selected' : ''}`}
                                          onClick={() => handleSelectOption(opt)}
                                        >
                                          <div className="cust-mobile-card-header">
                                            <div className="cust-radio-cell">
                                              <input
                                                type="radio"
                                                name="subscription_plan_mob"
                                                className="cust-radio-input"
                                                checked={isSelected}
                                                onChange={() => handleSelectOption(opt)}
                                              />
                                              <span className="cust-mobile-duration-title">{opt.duration}</span>
                                            </div>
                                            {calc.discountPercent > 0 && (
                                              <span className="cust-badge-discount">
                                                {calc.discountPercent}% OFF
                                              </span>
                                            )}
                                          </div>

                                          <div className="cust-mobile-pricing-rows">
                                            <div className="cust-mobile-price-row">
                                              <span className="cust-mobile-row-lbl">Base Price</span>
                                              <span className="cust-mobile-row-val">{formatINR(calc.basePrice)}</span>
                                            </div>

                                            {calc.discountPercent > 0 && (
                                              <div className="cust-mobile-price-row discount-highlight">
                                                <span className="cust-mobile-row-lbl">Discounted Price</span>
                                                <span className="cust-mobile-row-val discount-val">
                                                  {formatINR(calc.discountedPrice)}
                                                </span>
                                              </div>
                                            )}

                                            <div className="cust-mobile-price-row">
                                              <span className="cust-mobile-row-lbl">GST (18%)</span>
                                              <span className="cust-mobile-row-val">{formatINR(calc.gstAmount)}</span>
                                            </div>

                                            <div className="cust-mobile-price-row total-highlight">
                                              <span className="cust-mobile-row-lbl">Total Payable</span>
                                              <span className="cust-mobile-row-val total-val">
                                                {formatINR(calc.totalPayable)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                /* Group 2, 3, 4: Card / Row Option Selectors */
                                <div className="cust-options-grid">
                                  {group.options.map((opt) => {
                                    const calc = calculatePlanPricing(opt);
                                    const isSelected = opt.id === selectedPlanId;

                                    return (
                                      <div
                                        key={opt.id}
                                        className={`cust-option-card ${isSelected ? 'is-selected' : ''}`}
                                        onClick={() => handleSelectOption(opt)}
                                      >
                                        <div className="cust-option-card-left">
                                          <input
                                            type="radio"
                                            name="subscription_plan"
                                            className="cust-radio-input"
                                            checked={isSelected}
                                            onChange={() => handleSelectOption(opt)}
                                          />
                                          <div className="cust-option-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                              <span className="cust-option-name">{opt.name}</span>
                                              {opt.offerBadge && (
                                                <span className="cust-offer-badge">
                                                  🎁 {opt.offerBadge}
                                                </span>
                                              )}
                                            </div>
                                            <span className="cust-option-sub">
                                              {opt.subName} • {opt.duration}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="cust-option-card-right">
                                          <div className="cust-option-breakdown">
                                            <span className="cust-option-base">Base: {formatINR(calc.basePrice)}</span>
                                            <span className="cust-option-gst">+18% GST: {formatINR(calc.gstAmount)}</span>
                                          </div>
                                          <span className="cust-option-total">{formatINR(calc.totalPayable)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 2. SELECT INSTALLATION DATE & 3. BILLING DURATION */}
                <section aria-labelledby="section-installation-duration">
                  <div className="cust-secondary-config-grid">

                    {/* Section 2: Installation Date */}
                    <div className="cust-config-card">
                      <div className="cust-config-label-row">
                        <label className="cust-config-label" htmlFor="cust-install-date-input">
                          <div className="cust-section-num-bubble" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>2</div>
                          <span>Select Installation Date</span>
                          <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div className="cust-quick-date-btns">
                          <button type="button" className="cust-quick-btn" onClick={handleSetToday}>
                            Today
                          </button>
                          <button type="button" className="cust-quick-btn" onClick={handleSetTomorrow}>
                            Tomorrow
                          </button>
                        </div>
                      </div>

                      <div className="cust-date-input-wrap">
                        <Calendar 
                          size={16} 
                          className="cust-date-icon" 
                          onClick={() => dateInputRef.current?.showPicker?.()} 
                          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          title="Click to open calendar"
                        />
                        <input
                          ref={dateInputRef}
                          id="cust-install-date-input"
                          type="date"
                          className="cust-date-input"
                          value={installationDate}
                          onChange={(e) => setInstallationDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3: Billing Duration */}
                    <div className="cust-config-card">
                      <div className="cust-config-label-row">
                        <div className="cust-config-label">
                          <div className="cust-section-num-bubble" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>3</div>
                          <span>Billing Duration</span>
                        </div>
                        <span className="cust-duration-badge">Auto Synchronized</span>
                      </div>

                      <div className="cust-duration-display-box">
                        <span className="cust-duration-val">
                          {activePlan.durationYears > 0 
                            ? `${activePlan.durationYears} ${activePlan.durationYears === 1 ? 'Year' : 'Years'}`
                            : activePlan.duration}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {activePlan.type}
                        </span>
                      </div>

                      {/* Expiry Date Display */}
                      <div className={`cust-expiry-callout ${!activePlan.hasExpiry ? 'is-lifetime' : ''}`}>
                        <Clock size={16} />
                        <span>
                          {activePlan.hasExpiry ? (
                            <>
                              Auto Expiry Date: <strong>{formatReadableDate(calculatedExpiryDate)}</strong>
                            </>
                          ) : (
                            <>
                              Schedule: <strong>Lifetime License (Perpetual / No Expiry)</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>
                </section>

              </div>

              {/* -------------------------------------------------------------
                  RIGHT COLUMN: STICKY PRICE SUMMARY (32%)
                  ------------------------------------------------------------- */}
              <aside className="cust-reg-right-col" aria-label="Order Price Summary">
                <div className="cust-summary-card">

                  <div className="cust-summary-header">
                    <h3 className="cust-summary-title">
                      <Receipt size={18} color="#0284c7" />
                      <span>Price Summary</span>
                    </h3>
                    <span className="cust-tax-pill">18% GST Applicable</span>
                  </div>

                  {/* Selected Plan Details Banner */}
                  <div className="cust-summary-plan-banner">
                    {(() => {
                      const activeGroup = SUBSCRIPTION_GROUPS.find((g) => g.groupId === activePlan.groupId);
                      const ActiveLogo = activeGroup?.LogoComponent;
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="cust-accordion-icon-box" style={{ width: '46px', height: '46px', padding: '2px', flexShrink: 0 }}>
                            {ActiveLogo && <ActiveLogo />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="cust-summary-plan-name">{activePlan.name}</span>
                            <div className="cust-summary-plan-type">
                              <span>{activePlan.duration}</span>
                              <span>•</span>
                              <span>{activePlan.type}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {priceDetails.discountPercent > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <span className="cust-badge-discount">
                          🎉 {priceDetails.discountPercent}% Discount Applied
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown Line Items */}
                  <div className="cust-price-breakdown">
                    <div className="cust-breakdown-row">
                      <span>Base Price</span>
                      <span className="cust-breakdown-val">{formatINR(priceDetails.basePrice)}</span>
                    </div>

                    {priceDetails.discountPercent > 0 && (
                      <>
                        <div className="cust-breakdown-row discount-row">
                          <span>Discount ({priceDetails.discountPercent}%)</span>
                          <span className="cust-breakdown-val discount-val">
                            −{formatINR(priceDetails.discountAmount)}
                          </span>
                        </div>

                        <div className="cust-breakdown-row">
                          <span>Discounted Price</span>
                          <span className="cust-breakdown-val">{formatINR(priceDetails.discountedPrice)}</span>
                        </div>
                      </>
                    )}

                    <div className="cust-breakdown-row">
                      <span>GST (18%)</span>
                      <span className="cust-breakdown-val">{formatINR(priceDetails.gstAmount)}</span>
                    </div>
                  </div>

                  {/* Prominent Total Payable Card (Light-blue background with bold blue text) */}
                  <div className="cust-total-payable-card">
                    <span className="cust-total-label">Total Payable Amount</span>
                    <span className="cust-total-amount">{formatINR(priceDetails.totalPayable)}</span>
                    <span className="cust-total-caption">Includes all statutory GST & setup charges</span>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <label className="cust-terms-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      I agree to NISPL Cloud Services terms of use, enterprise SLA, and authorize subscription onboarding.
                    </span>
                  </label>

                  {/* Complete Customer Registration Submit Action */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="cust-submit-order-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="ebolt-spinner" />
                    ) : (
                      <>
                        <span>Complete Customer Registration</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Security Trust Footer */}
                  <div className="cust-trust-footer">
                    <ShieldCheck size={14} color="#059669" />
                    <span>Authorized Tally 5-Star Partner • 256-Bit SSL</span>
                  </div>

                </div>
              </aside>

            </div>
          )}

        </div>
      </main>

      {/* =====================================================================
          SUCCESS CONFIRMATION DIALOG MODAL
          ===================================================================== */}
      {registeredData && (
        <div className="ebolt-modal-backdrop" onClick={() => navigate('/customer-login')}>
          <div className="ebolt-dialog-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="ebolt-dialog-header">
              <div className="ebolt-dialog-check">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="ebolt-dialog-title">Registration Completed</h3>
                <span className="ebolt-dialog-sub">Customer Onboarding Gateway</span>
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => navigate('/customer-login')}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              <div className="ebolt-session-user-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Account ID:</span>
                  <span style={{ fontSize: '0.9rem', color: '#0284C7', fontWeight: 700 }}>{registeredData.customerId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Company:</span>
                  <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 600 }}>{registeredData.companyName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Plan:</span>
                  <span style={{ fontSize: '0.88rem', color: '#0F172A' }}>{registeredData.planName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Installation:</span>
                  <span style={{ fontSize: '0.88rem', color: '#0F172A' }}>{formatReadableDate(registeredData.installationDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Duration / Expiry:</span>
                  <span style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 700 }}>
                    {registeredData.expiryDate ? formatReadableDate(registeredData.expiryDate) : 'Lifetime (Perpetual)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>Total Payable:</span>
                  <span style={{ fontSize: '1.05rem', color: '#0284C7', fontWeight: 800 }}>{formatINR(registeredData.pricing.totalPayable)}</span>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  className="ebolt-submit-btn"
                  onClick={() => navigate('/customer-login')}
                >
                  Proceed to Customer Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
