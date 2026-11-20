import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Select from 'react-select';
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  MapPin,
  Loader2,
  CalendarDays,
  Clock3,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Phone,
  Plus,
  Trash2,
  Building2,
  Key,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../../../services/authApi';
import ProfileAvatarUploader from '../../../components/common/ProfileAvatarUploader';
import ProfileCompletionCircle from '../../../components/common/ProfileCompletionCircle';
import { getProfileCompletion } from '../../../utils/profileCompletion';
import { notifyDataChanged } from '../../../utils/dataBus';
import {
  COUNTRIES,
  getStatesByCountry,
  getCitiesByState
} from '../../login/Admin/locationData';
import { customSelectStyles } from '../../login/Admin/reactSelectStyles';
import toast from 'react-hot-toast';
import '../../login/Admin/AdminTools.css';
import './CustomerProfilePage.css';

const PORTAL_NAME = 'NISPL Customer Portal';
const SIGN_IN_METHOD = 'Primary Email & Password';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const capitalize = (value) => {
  if (!value) return '—';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

export default function CustomerProfilePage({ customer: initialCustomer, onSignOut, onProfileUpdated }) {
  const initialUser = initialCustomer || authApi.getCurrentUser() || {};
  const [profile, setProfile] = useState(initialUser && Object.keys(initialUser).length > 0 ? initialUser : null);
  const [isLoading, setIsLoading] = useState(!initialCustomer && !authApi.getCurrentUser());
  const [loadError, setLoadError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const hasLoadedRef = useRef(false);

  // Section 1: Contact Overview State (matches Create Customer)
  const initialRawName = initialUser.name || '';
  const initialNameParts = initialRawName.trim().split(' ');
  const [firstName, setFirstName] = useState(initialUser.firstName || initialNameParts[0] || '');
  const [lastName, setLastName] = useState(initialUser.lastName || initialNameParts.slice(1).join(' ') || '');
  const [designation, setDesignation] = useState(initialUser.designation || '');
  const [company, setCompany] = useState(initialUser.company || '');
  const [primaryPhone, setPrimaryPhone] = useState(initialUser.phone || '');
  const [gstNo, setGstNo] = useState(initialUser.gstNo || '');
  const [tallySerialNo, setTallySerialNo] = useState(initialUser.tallySerialNo || '');

  // Section 2: Address Information State (cascading dropdowns)
  const initialAddress = initialUser.address || {};
  const [selectedCountry, setSelectedCountry] = useState(initialAddress.country || 'India');
  const [selectedState, setSelectedState] = useState(initialAddress.state || 'West Bengal');
  const [selectedCity, setSelectedCity] = useState(initialAddress.city || 'Kolkata');
  const [customCityInput, setCustomCityInput] = useState('');
  const [postalCode, setPostalCode] = useState(initialAddress.postalCode || '');
  const [street, setStreet] = useState(initialAddress.street || '');
  const [area, setArea] = useState(initialAddress.area || '');

  // Section 3: Additional Communication Channels (Secondary Emails & Phones)
  const [additionalEmails, setAdditionalEmails] = useState(Array.isArray(initialUser.additionalEmails) ? initialUser.additionalEmails : []);
  const [additionalPhones, setAdditionalPhones] = useState(Array.isArray(initialUser.additionalPhones) ? initialUser.additionalPhones : []);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Section 5: Change Password Form State
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwVisibility, setPwVisibility] = useState({ current: false, next: false, confirm: false });
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Country Options formatted for React Select
  const countryOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({ value: c, label: c }));
  }, []);

  // Dynamically derive filtered States based on selected Country
  const availableStates = useMemo(() => {
    return getStatesByCountry(selectedCountry);
  }, [selectedCountry]);

  const stateOptions = useMemo(() => {
    return availableStates.map((s) => ({ value: s, label: s }));
  }, [availableStates]);

  // Dynamically derive filtered Cities based on selected State & Country
  const availableCities = useMemo(() => {
    return getCitiesByState(selectedCountry, selectedState);
  }, [selectedCountry, selectedState]);

  const cityOptions = useMemo(() => {
    const list = availableCities.map((city) => ({ value: city, label: city }));
    list.push({ value: 'Other', label: 'Other (Custom City)...' });
    return list;
  }, [availableCities]);

  // Cascading location handlers
  const handleCountryChange = (selected) => {
    const nextCountry = selected?.value || 'India';
    setSelectedCountry(nextCountry);

    const states = getStatesByCountry(nextCountry);
    const nextState = states[0] || '';
    setSelectedState(nextState);

    const cities = getCitiesByState(nextCountry, nextState);
    const nextCity = cities[0] || '';
    setSelectedCity(nextCity);
    setCustomCityInput('');
  };

  const handleStateChange = (selected) => {
    const nextState = selected?.value || '';
    setSelectedState(nextState);

    const cities = getCitiesByState(selectedCountry, nextState);
    const nextCity = cities[0] || '';
    setSelectedCity(nextCity);
    setCustomCityInput('');
  };

  const handleCityChange = (selected) => {
    const nextCity = selected?.value || '';
    setSelectedCity(nextCity);
    if (nextCity !== 'Other') {
      setCustomCityInput('');
    }
  };

  const isCustomCity = selectedCity === 'Other';

  const populateFormFields = useCallback((user) => {
    if (!user) return;
    setProfile(user);

    const rawName = user.name || '';
    const nameParts = rawName.trim().split(' ');
    setFirstName(user.firstName || nameParts[0] || '');
    setLastName(user.lastName || nameParts.slice(1).join(' ') || '');
    setCompany(user.company || '');
    setDesignation(user.designation || '');
    setGstNo(user.gstNo || '');
    setTallySerialNo(user.tallySerialNo || '');
    setPrimaryPhone(user.phone || '');

    setAdditionalEmails(Array.isArray(user.additionalEmails) ? user.additionalEmails : []);
    setAdditionalPhones(Array.isArray(user.additionalPhones) ? user.additionalPhones : []);

    if (user.address) {
      const cCountry = user.address.country || 'India';
      const cState = user.address.state || 'West Bengal';
      const cCity = user.address.city || 'Kolkata';
      setSelectedCountry(cCountry);
      setSelectedState(cState);

      const citiesForState = getCitiesByState(cCountry, cState);
      if (citiesForState.includes(cCity)) {
        setSelectedCity(cCity);
        setCustomCityInput('');
      } else if (cCity) {
        setSelectedCity('Other');
        setCustomCityInput(cCity);
      } else {
        setSelectedCity(citiesForState[0] || 'Kolkata');
        setCustomCityInput('');
      }

      setPostalCode(user.address.postalCode || '');
      setStreet(user.address.street || '');
      setArea(user.address.area || '');
    }
  }, []);

  // Load Customer Profile
  const loadProfile = useCallback(async (isManualRetry = false) => {
    if (isManualRetry) {
      setIsLoading(true);
    }
    setLoadError('');
    try {
      const user = await authApi.getProfile();
      if (user) {
        populateFormFields(user);
      }
    } catch (err) {
      console.warn('[CustomerProfilePage] Failed to fetch profile:', err);
      if (!profile) {
        setLoadError(err.message || 'Failed to load profile.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [populateFormFields, profile]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadProfile(false);
    }
  }, [loadProfile]);

  const primaryEmail = profile?.email || initialCustomer?.email || '';
  const customerId = profile?.customerId || initialCustomer?.customerId || '—';
  const role = capitalize(profile?.role || 'Customer');
  const accountStatus = profile?.accountStatus || 'active';

  const handleCopyCustomerId = () => {
    if (customerId && customerId !== '—') {
      navigator.clipboard.writeText(customerId);
      setCopiedId(true);
      toast.success('Customer ID copied to clipboard!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Additional secondary emails handlers
  const handleAddEmail = () => {
    setAdditionalEmails((prev) => [...prev, '']);
  };

  const handleEmailChange = (index, value) => {
    setAdditionalEmails((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveEmail = (index) => {
    setAdditionalEmails((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Additional secondary phones handlers
  const handleAddPhone = () => {
    setAdditionalPhones((prev) => [...prev, '']);
  };

  const handlePhoneChange = (index, value) => {
    setAdditionalPhones((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemovePhone = (index) => {
    setAdditionalPhones((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cancel / Revert changes
  const handleCancel = () => {
    if (!profile) return;
    populateFormFields(profile);
    toast('Form reverted to saved profile data.', { icon: '↩️' });
  };

  // Save Contact & Address Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!company.trim()) {
      toast.error('Company name is required.');
      return;
    }

    const cleanPrimaryPhone = primaryPhone.trim().replace(/\D/g, '');
    if (!cleanPrimaryPhone) {
      toast.error('Primary phone number is required.');
      return;
    }
    if (cleanPrimaryPhone.length !== 10) {
      toast.error(`Primary phone number must be exactly 10 digits (currently ${cleanPrimaryPhone.length} digits).`);
      return;
    }

    if (isCustomCity && !customCityInput.trim()) {
      toast.error('Please enter your custom city name.');
      return;
    }

    // Validate additional phone numbers
    for (let i = 0; i < additionalPhones.length; i++) {
      const cleanExtraPhone = additionalPhones[i].trim().replace(/\D/g, '');
      if (!cleanExtraPhone) {
        toast.error(`Secondary phone #${i + 1} cannot be empty. Enter a 10-digit number or remove it.`);
        return;
      }
      if (cleanExtraPhone.length !== 10) {
        toast.error(`Secondary phone #${i + 1} must be exactly 10 digits.`);
        return;
      }
    }

    // Validate additional emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const em of additionalEmails) {
      const cleanEm = em.trim();
      if (cleanEm && !emailRegex.test(cleanEm)) {
        toast.error(`Invalid email format: "${cleanEm}"`);
        return;
      }
      if (cleanEm.toLowerCase() === primaryEmail.toLowerCase()) {
        toast.error(`"${cleanEm}" is already your primary login email.`);
        return;
      }
    }

    setIsSavingProfile(true);
    const toastId = toast.loading('Saving customer details...');
    try {
      const filteredEmails = additionalEmails.map((e) => e.trim()).filter(Boolean);
      const filteredPhones = additionalPhones.map((p) => p.trim().replace(/\D/g, '')).filter(Boolean);
      const effectiveCity = isCustomCity ? customCityInput.trim() : selectedCity;
      const combinedName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');

      const res = await authApi.updateOwnProfile({
        name: combinedName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company.trim(),
        designation: designation.trim(),
        gstNo: gstNo.trim(),
        tallySerialNo: tallySerialNo.trim(),
        phone: cleanPrimaryPhone,
        address: {
          country: selectedCountry,
          state: selectedState,
          city: effectiveCity,
          postalCode: postalCode.replace(/\D/g, '').slice(0, 6),
          street: street.trim(),
          area: area.trim(),
          addressType: 'Office / Billing'
        },
        additionalEmails: filteredEmails,
        additionalPhones: filteredPhones
      });

      setProfile(res.user);
      setPrimaryPhone(res.user.phone || cleanPrimaryPhone);
      setAdditionalEmails(res.user.additionalEmails || []);
      setAdditionalPhones(res.user.additionalPhones || []);
      notifyDataChanged('account');
      window.dispatchEvent(new Event('nispl_auth_change'));
      if (onProfileUpdated) {
        onProfileUpdated(res.user);
      }
      toast.success('Customer profile and address details saved successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (newAvatar) => {
    const res = await authApi.updateOwnProfile({ avatar: newAvatar });
    setProfile((prev) => ({
      ...prev,
      avatar: newAvatar,
      companyLogo: newAvatar
    }));
    notifyDataChanged('account');
    window.dispatchEvent(new Event('nispl_auth_change'));
    if (onProfileUpdated) {
      onProfileUpdated({ ...(profile || {}), avatar: newAvatar, companyLogo: newAvatar });
    }
    return res;
  };

  // Change Password Handler
  const handleChangePassword = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = pwForm;

    if (!currentPassword) {
      toast.error('Enter your current password.');
      return;
    }
    if (newPassword.length < 10) {
      toast.error('New password must be at least 10 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPw(true);
    const toastId = toast.loading('Changing password...');
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully! Please sign in with your new password.', { id: toastId });
      authApi.clearAuthSession();
      setTimeout(() => {
        if (onSignOut) {
          onSignOut();
        } else {
          window.location.href = '/customer-login';
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to change password.', { id: toastId });
      setIsChangingPw(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="adm-table-card cust-profile-wrapper">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h1 className="adm-section-title">Customer Profile</h1>
            <p className="adm-section-sub">Loading your customer profile from the server…</p>
          </div>
        </div>
        <div className="admin-datatable-loading" style={{ padding: '60px 40px' }}>
          <Loader2 size={22} className="admin-datatable-spinner" />
          <span>Fetching customer details…</span>
        </div>
      </div>
    );
  }

  if (loadError && !profile) {
    return (
      <div className="adm-table-card cust-profile-wrapper">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h1 className="adm-section-title">Customer Profile</h1>
            <p className="adm-section-sub">Your profile could not be loaded.</p>
          </div>
        </div>
        <div className="admin-datatable-empty" style={{ padding: '60px 20px' }}>
          <span className="admin-datatable-empty-icon">
            <AlertCircle size={22} />
          </span>
          <div className="admin-datatable-empty-title">{loadError}</div>
          <div className="admin-datatable-empty-hint">Please check your connection and retry.</div>
          <button type="button" className="adm-btn-primary" style={{ marginTop: '14px' }} onClick={() => loadProfile(true)}>
            <RefreshCw size={15} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const pwField = (label, key, visibilityKey, placeholder, autoComplete) => (
    <div className="adm-profile-pw-field">
      <label className="adm-profile-info-label" htmlFor={`cust-pw-${key}`}>{label}</label>
      <div className="adm-profile-pw-input-wrap">
        <input
          id={`cust-pw-${key}`}
          type={pwVisibility[visibilityKey] ? 'text' : 'password'}
          className="adm-form-input"
          value={pwForm[key]}
          autoComplete={autoComplete}
          onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="adm-profile-pw-eye"
          onClick={() => setPwVisibility((prev) => ({ ...prev, [visibilityKey]: !prev[visibilityKey] }))}
          aria-label={pwVisibility[visibilityKey] ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {pwVisibility[visibilityKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  const fullNameDisplay = [firstName, lastName].filter(Boolean).join(' ') || profile?.name || 'Customer Account';

  const currentCompletionUser = {
    ...(profile || {}),
    name: fullNameDisplay,
    firstName,
    lastName,
    company,
    designation,
    gstNo,
    tallySerialNo,
    phone: primaryPhone,
    email: primaryEmail,
    address: {
      country: selectedCountry,
      state: selectedState,
      city: isCustomCity ? customCityInput : selectedCity,
      postalCode,
      street,
      area
    },
    additionalEmails,
    additionalPhones,
    isEmailVerified: Boolean(profile?.isEmailVerified || initialCustomer?.isEmailVerified)
  };
  const liveCompletion = getProfileCompletion(currentCompletionUser);

  return (
    <div className="adm-table-card adm-form-card cust-profile-wrapper">
      {/* Header */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Customer Profile</h1>
          <p className="adm-section-sub">
            Your contact details, physical address information, and account security for the {PORTAL_NAME}.
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="adm-profile-hero" style={{ marginTop: '16px' }}>
        <ProfileAvatarUploader
          avatar={profile?.avatar || profile?.companyLogo || initialCustomer?.avatar || initialCustomer?.companyLogo || ''}
          name={fullNameDisplay}
          size={74}
          borderRadius={20}
          onAvatarChange={handleAvatarChange}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="adm-profile-hero-name">{fullNameDisplay}</h2>
          <p className="adm-profile-hero-email" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{primaryEmail}</span>
            <span className="cust-primary-badge">Primary (Login ID)</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span className="adm-profile-role-pill">{role}</span>
            <span className={`adm-profile-status-pill ${accountStatus}`}>
              <ShieldCheck size={12} />
              <span>{capitalize(accountStatus)} Account</span>
            </span>
            {customerId && customerId !== '—' && (
              <span className="cust-id-pill" onClick={handleCopyCustomerId} title="Click to copy Customer ID">
                <Key size={11} color="#6366f1" />
                <span>{customerId}</span>
                {copiedId ? <Check size={11} color="#16a34a" /> : <Copy size={11} color="#94a3b8" />}
              </span>
            )}
          </div>
        </div>
        <div className="adm-profile-hero-side">
          {liveCompletion.percentage < 100 && (
            <div className="adm-profile-hero-side-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ProfileCompletionCircle
                percentage={liveCompletion.percentage}
                size={38}
                strokeWidth={3.2}
                showPercentageInside={true}
              />
              <div>
                <span className="adm-profile-info-label">Profile Completion</span>
                <span
                  className="adm-profile-hero-side-value"
                  style={{
                    color: liveCompletion.percentage >= 60 ? '#6366f1' : '#d97706',
                    fontWeight: 800
                  }}
                >
                  {liveCompletion.percentage}% ({liveCompletion.completedCount}/{liveCompletion.totalCount})
                </span>
              </div>
            </div>
          )}
          <div className="adm-profile-hero-side-item">
            <span className="adm-profile-info-label">Last Sign-In</span>
            <span className="adm-profile-hero-side-value">{formatDateTime(profile?.lastLoginAt)}</span>
          </div>
          <div className="adm-profile-hero-side-item">
            <span className="adm-profile-info-label">Member Since</span>
            <span className="adm-profile-hero-side-value">{formatDate(profile?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} style={{ marginTop: '28px' }}>
        {/* =========================================================================
            SECTION 1: CONTACT OVERVIEW (Matches Create Customer Exactly)
            ========================================================================= */}
        <div className="adm-form-section">
          <div className="adm-form-section-title">
            <UserCheck size={18} className="adm-form-section-icon purple" />
            <span>Contact Overview</span>
          </div>

          <div className="adm-form-grid">
            <div className="adm-form-field">
              <label className="adm-form-label">
                First Name <span className="adm-required-star">*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter the first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">Last Name</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter the last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">Designation</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. Finance Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">
                Email <span className="adm-required-star">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="Enter your email address"
                  value={primaryEmail}
                  disabled
                  title="Primary email used for account authentication"
                  style={{ paddingRight: '105px' }}
                />
                <span
                  className="cust-row-badge primary"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.70rem'
                  }}
                >
                  Login ID
                </span>
              </div>
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">
                Phone No. <span className="adm-required-star">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="adm-form-input"
                placeholder="Enter your 10-digit phone number"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">
                Company Name <span className="adm-required-star">*</span>
              </label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter company / firm name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">GSTIN</label>
              <input
                type="text"
                className="adm-form-input font-mono"
                placeholder="Enter the GSTIN"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>

            <div className="adm-form-field">
              <label className="adm-form-label">Tally SL No.</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter the Tally serial number"
                value={tallySerialNo}
                onChange={(e) => setTallySerialNo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: ADDRESS INFORMATION (Matches Create Customer Exactly)
            ========================================================================= */}
        <div className="adm-form-section" style={{ marginTop: '28px' }}>
          <div className="adm-form-section-title">
            <MapPin size={18} className="adm-form-section-icon blue" />
            <span>Address Information</span>
          </div>

          <div className="adm-form-grid">
            {/* Country Selection with React Select */}
            <div className="adm-form-field">
              <label className="adm-form-label">
                Country <span className="adm-required-star">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                isSearchable={true}
                options={countryOptions}
                value={{ value: selectedCountry, label: selectedCountry }}
                onChange={handleCountryChange}
                placeholder="Search and select country..."
                classNamePrefix="react-select"
              />
            </div>

            {/* State Selection with React Select (Filtered by Country) */}
            <div className="adm-form-field">
              <label className="adm-form-label">
                State / Province <span className="adm-required-star">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                isSearchable={true}
                options={stateOptions}
                value={selectedState ? { value: selectedState, label: selectedState } : null}
                onChange={handleStateChange}
                placeholder="Search and select state..."
                classNamePrefix="react-select"
              />
            </div>

            {/* City Selection with React Select (Filtered by State) */}
            <div className="adm-form-field">
              <label className="adm-form-label">
                City <span className="adm-required-star">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                isSearchable={true}
                options={cityOptions}
                value={
                  selectedCity
                    ? selectedCity === 'Other'
                      ? { value: 'Other', label: 'Other (Custom City)...' }
                      : { value: selectedCity, label: selectedCity }
                    : null
                }
                onChange={handleCityChange}
                placeholder="Search and select city..."
                classNamePrefix="react-select"
              />

              {isCustomCity && (
                <input
                  type="text"
                  className="adm-form-input"
                  style={{ marginTop: '8px' }}
                  placeholder="Enter custom city name"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Postal Code */}
            <div className="adm-form-field">
              <label className="adm-form-label">Postal / PIN Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="adm-form-input"
                placeholder="Enter 6-digit PIN code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            {/* Street Address (Full Width) */}
            <div className="adm-form-field full-width">
              <label className="adm-form-label">Street / Location</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter street address, building or suite"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            {/* Area / Locality */}
            <div className="adm-form-field">
              <label className="adm-form-label">Area / Locality</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Enter your area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: ADDITIONAL COMMUNICATION CHANNELS (Secondary Emails & Phones)
            ========================================================================= */}
        <div className="adm-form-section" style={{ marginTop: '28px' }}>
          <div className="adm-form-section-title">
            <Mail size={18} className="adm-form-section-icon emerald" />
            <span>Additional Communication Channels</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Secondary Emails Box */}
            <div className="cust-section-box">
              <div className="cust-section-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="cust-section-icon"><Mail size={16} /></span>
                  <div>
                    <h3 className="cust-section-title">Secondary Emails</h3>
                    <p className="cust-section-desc">Add team emails for billing & service alerts.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="cust-btn-add"
                  onClick={handleAddEmail}
                  title="Add another email address"
                >
                  <Plus size={14} />
                  <span>Add Email</span>
                </button>
              </div>

              <div className="cust-input-list">
                {additionalEmails.map((emailVal, idx) => (
                  <div key={idx} className="cust-input-row animate-fade-in">
                    <div className="cust-input-prefix">
                      <Mail size={15} color="#94a3b8" />
                    </div>
                    <input
                      type="email"
                      className="adm-form-input cust-input-field"
                      placeholder={`Secondary Email ${idx + 1}`}
                      value={emailVal}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="cust-btn-remove"
                      onClick={() => handleRemoveEmail(idx)}
                      title="Remove this email"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {additionalEmails.length === 0 && (
                  <div className="cust-empty-hint">
                    No secondary emails added. Click <strong>+ Add Email</strong> to add alternate team addresses.
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Phones Box */}
            <div className="cust-section-box">
              <div className="cust-section-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="cust-section-icon"><Phone size={16} /></span>
                  <div>
                    <h3 className="cust-section-title">Secondary Phones</h3>
                    <p className="cust-section-desc">Alternate 10-digit numbers for team notifications.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="cust-btn-add"
                  onClick={handleAddPhone}
                  title="Add another phone number"
                >
                  <Plus size={14} />
                  <span>Add Phone</span>
                </button>
              </div>

              <div className="cust-input-list">
                {additionalPhones.map((phoneVal, idx) => (
                  <div key={idx} className="cust-input-row animate-fade-in">
                    <div className="cust-input-prefix">
                      <Phone size={15} color="#94a3b8" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="adm-form-input cust-input-field"
                      placeholder={`Secondary Phone ${idx + 1} (10 digits)`}
                      value={phoneVal}
                      onChange={(e) => handlePhoneChange(idx, e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                    <button
                      type="button"
                      className="cust-btn-remove"
                      onClick={() => handleRemovePhone(idx)}
                      title="Remove this phone"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {additionalPhones.length === 0 && (
                  <div className="cust-empty-hint">
                    No secondary phones added. Click <strong>+ Add Phone</strong> to add alternate 10-digit numbers.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ACTIONS (Matches Screenshot Exactly)
            ========================================================================= */}
        <div className="adm-form-footer">
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={handleCancel}
            disabled={isSavingProfile}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="adm-btn-primary"
            disabled={isSavingProfile}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            {isSavingProfile ? <Loader2 size={16} className="adm-spinner" /> : <Check size={16} />}
            <span>{isSavingProfile ? 'Saving Details...' : '✓ Save Customer'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 4: ACCESS & SECURITY CLEARANCE */}
      <div className="adm-profile-group-label" style={{ marginTop: '36px' }}>
        Access &amp; Security Clearance
      </div>
      <div className="adm-profile-info-grid">
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Portal Access</div>
          <div className="adm-profile-info-value">{PORTAL_NAME}</div>
        </div>
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Role</div>
          <div className="adm-profile-info-value">{role}</div>
        </div>
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Customer ID</div>
          <div className="adm-profile-info-value" style={{ fontFamily: 'monospace', color: '#6366f1' }}>
            {customerId}
          </div>
        </div>
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Account Status</div>
          <div className="adm-profile-info-value" style={{ color: '#059669', fontWeight: 700 }}>
            {capitalize(accountStatus)}
          </div>
        </div>
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Sign-In Method</div>
          <div className="adm-profile-info-value">{SIGN_IN_METHOD}</div>
        </div>
        <div className="adm-profile-info-card">
          <div className="adm-profile-info-label">Member Since</div>
          <div className="adm-profile-info-value">{formatDate(profile?.createdAt)}</div>
        </div>
      </div>

      {/* SECTION 5: SECURITY & PASSWORD */}
      <div className="adm-profile-group-label" style={{ marginTop: '32px' }}>Security &amp; Password</div>
      <div className="adm-profile-pw-card">
        <div className="adm-profile-pw-head">
          <span className="adm-profile-pw-head-icon"><Lock size={16} /></span>
          <div>
            <div className="adm-profile-pw-head-title">Update your password</div>
            <div className="adm-profile-pw-head-sub">
              Minimum 10 characters. Changing your password signs out all active sessions across all devices.
            </div>
          </div>
        </div>
        <form className="adm-profile-pw-form" onSubmit={handleChangePassword}>
          {pwField('Current Password', 'currentPassword', 'current', 'Enter current password', 'current-password')}
          {pwField('New Password', 'newPassword', 'next', 'At least 10 characters', 'new-password')}
          {pwField('Confirm New Password', 'confirmPassword', 'confirm', 'Repeat new password', 'new-password')}
          <div className="adm-profile-pw-actions">
            <button
              type="submit"
              className="adm-btn-primary cust-change-pw-btn"
              disabled={isChangingPw}
            >
              {isChangingPw ? <Loader2 size={15} className="adm-spinner" /> : <KeyRound size={15} />}
              <span>{isChangingPw ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
