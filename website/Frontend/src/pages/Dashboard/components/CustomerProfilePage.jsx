import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserCog,
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
  FileText,
  Key,
  Copy,
  Check,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../../../services/authApi';
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

const initialsOf = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'C';

export default function CustomerProfilePage({ customer: initialCustomer, onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Editable Profile Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [additionalPhones, setAdditionalPhones] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form State
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwVisibility, setPwVisibility] = useState({ current: false, next: false, confirm: false });
  const [isChangingPw, setIsChangingPw] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const user = await authApi.getProfile();
      setProfile(user);
      setName(user.name || '');
      setCompany(user.company || '');
      setDesignation(user.designation || '');
      setGstNo(user.gstNo || '');
      setPrimaryPhone(user.phone || '');
      setAdditionalEmails(Array.isArray(user.additionalEmails) ? user.additionalEmails : []);
      setAdditionalPhones(Array.isArray(user.additionalPhones) ? user.additionalPhones : []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
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

  // Multiple Emails handlers
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

  // Multiple Phone numbers handlers
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

  // Save Contact & Organization Information
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Contact person name is required.');
      return;
    }

    // Validate primary phone (must be exactly 10 digits)
    const cleanPrimaryPhone = primaryPhone.trim().replace(/\D/g, '');
    if (!cleanPrimaryPhone) {
      toast.error('Primary phone number is required.');
      return;
    }
    if (cleanPrimaryPhone.length !== 10) {
      toast.error(`Primary phone number must be exactly 10 digits (currently ${cleanPrimaryPhone.length} digits).`);
      return;
    }

    // Validate additional phone numbers (must be exactly 10 digits)
    for (let i = 0; i < additionalPhones.length; i++) {
      const cleanExtraPhone = additionalPhones[i].trim().replace(/\D/g, '');
      if (!cleanExtraPhone) {
        toast.error(`Secondary phone #${i + 1} cannot be empty. Please enter a 10-digit number or remove it.`);
        return;
      }
      if (cleanExtraPhone.length !== 10) {
        toast.error(`Secondary phone #${i + 1} ("${additionalPhones[i]}") must be exactly 10 digits (currently ${cleanExtraPhone.length} digits).`);
        return;
      }
    }

    // Validate emails format
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
    const toastId = toast.loading('Saving profile changes...');
    try {
      const filteredEmails = additionalEmails.map((e) => e.trim()).filter(Boolean);
      const filteredPhones = additionalPhones.map((p) => p.trim().replace(/\D/g, '')).filter(Boolean);

      const res = await authApi.updateOwnProfile({
        name: name.trim(),
        company: company.trim(),
        designation: designation.trim(),
        gstNo: gstNo.trim(),
        phone: cleanPrimaryPhone,
        additionalEmails: filteredEmails,
        additionalPhones: filteredPhones
      });

      setProfile(res.user);
      setPrimaryPhone(res.user.phone || cleanPrimaryPhone);
      setAdditionalEmails(res.user.additionalEmails || []);
      setAdditionalPhones(res.user.additionalPhones || []);
      toast.success('Profile and contact details saved successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
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

  if (isLoading) {
    return (
      <div className="adm-table-card animate-fade-in">
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

  if (loadError) {
    return (
      <div className="adm-table-card animate-fade-in">
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
          <button type="button" className="adm-btn-primary" style={{ marginTop: '14px' }} onClick={loadProfile}>
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

  return (
    <div className="adm-table-card animate-fade-in cust-profile-wrapper">
      {/* Header */}
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Customer Profile</h1>
          <p className="adm-section-sub">
            Your identity, multi-contact communication channels, and account security details for the {PORTAL_NAME}.
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="adm-profile-hero" style={{ marginTop: '16px' }}>
        <span className="adm-profile-hero-avatar">{initialsOf(name || profile?.name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="adm-profile-hero-name">{name || profile?.name || 'Customer Account'}</h2>
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

      {/* Section: Contact Channels & Multiple Communication Records */}
      <div className="adm-profile-group-label" style={{ marginTop: '28px' }}>
        Contact Channels &amp; Notifications
      </div>
      
      {/* Profile Form for Contact & Organization Details */}
      <form onSubmit={handleSaveProfile}>
        {/* SECTION 1: EMAIL ADDRESSES */}
        <div className="cust-section-box">
          <div className="cust-section-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="cust-section-icon"><Mail size={16} /></span>
              <div>
                <h3 className="cust-section-title">Email Addresses</h3>
                <p className="cust-section-desc">
                  Your primary email is your unique login credential. Add secondary email addresses for billing and service notifications.
                </p>
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
            {/* Primary Email (Immutable Login Identifier) */}
            <div className="cust-input-row primary-locked">
              <div className="cust-input-prefix">
                <Mail size={15} color="#6366f1" />
              </div>
              <input
                type="email"
                className="adm-form-input cust-input-field"
                value={primaryEmail}
                disabled
                title="Primary email used for account authentication"
              />
              <span className="cust-row-badge primary">Primary (Login ID)</span>
            </div>

            {/* Additional Secondary Emails */}
            {additionalEmails.map((emailVal, idx) => (
              <div key={idx} className="cust-input-row animate-fade-in">
                <div className="cust-input-prefix">
                  <Mail size={15} color="#94a3b8" />
                </div>
                <input
                  type="email"
                  className="adm-form-input cust-input-field"
                  placeholder={`Secondary Email ${idx + 1} (e.g. accounts@company.com)`}
                  value={emailVal}
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                />
                <span className="cust-row-badge secondary">Secondary</span>
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
                No additional emails added yet. Click <strong>+ Add Email</strong> to add secondary addresses for team alerts.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: PHONE NUMBERS (10-Digit Validation) */}
        <div className="cust-section-box" style={{ marginTop: '20px' }}>
          <div className="cust-section-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="cust-section-icon"><Phone size={16} /></span>
              <div>
                <h3 className="cust-section-title">Phone Numbers</h3>
                <p className="cust-section-desc">
                  Strict 10-digit contact numbers. Your primary phone receives urgent alerts. Add secondary numbers for team contact.
                </p>
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
            {/* Primary Phone */}
            <div className="cust-input-row primary-row">
              <div className="cust-input-prefix">
                <Phone size={15} color="#6366f1" />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="adm-form-input cust-input-field"
                placeholder="10-digit primary phone (e.g. 9830012345)"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <span className="cust-row-badge primary">Primary (10 digits)</span>
            </div>

            {/* Additional Secondary Phones */}
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
                  placeholder={`10-digit Secondary Phone ${idx + 1} (e.g. 9831122334)`}
                  value={phoneVal}
                  onChange={(e) => handlePhoneChange(idx, e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                <span className="cust-row-badge secondary">Secondary (10 digits)</span>
                <button
                  type="button"
                  className="cust-btn-remove"
                  onClick={() => handleRemovePhone(idx)}
                  title="Remove this phone number"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {additionalPhones.length === 0 && (
              <div className="cust-empty-hint">
                No additional phone numbers added yet. Click <strong>+ Add Phone</strong> to add alternate 10-digit numbers.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: OTHER ACCOUNT & ORGANIZATION DETAILS */}
        <div className="adm-profile-group-label" style={{ marginTop: '28px' }}>
          Account Information
        </div>

        <div className="cust-section-box">
          <div className="cust-section-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="cust-section-icon"><Building2 size={16} /></span>
              <div>
                <h3 className="cust-section-title">Organization &amp; Profile Details</h3>
                <p className="cust-section-desc">
                  Contact person and business identifiers for official tax invoicing and billing accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="cust-details-grid">
            <div className="adm-profile-pw-field">
              <label className="adm-profile-info-label" htmlFor="cust-name">Authorized Contact Person</label>
              <input
                id="cust-name"
                type="text"
                className="adm-form-input"
                placeholder="Full Contact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="adm-profile-pw-field">
              <label className="adm-profile-info-label" htmlFor="cust-company">Company / Business Name</label>
              <input
                id="cust-company"
                type="text"
                className="adm-form-input"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="adm-profile-pw-field">
              <label className="adm-profile-info-label" htmlFor="cust-designation">Designation / Role</label>
              <input
                id="cust-designation"
                type="text"
                className="adm-form-input"
                placeholder="e.g. Managing Director / IT Head"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="adm-profile-pw-field">
              <label className="adm-profile-info-label" htmlFor="cust-gst">GST Number (GSTIN)</label>
              <input
                id="cust-gst"
                type="text"
                className="adm-form-input font-mono"
                placeholder="15-digit GSTIN (e.g. 19AAAAA0000A1Z5)"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="adm-btn-primary cust-save-btn"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? <Loader2 size={15} className="adm-spinner" /> : <Save size={15} />}
              <span>{isSavingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 4: ACCOUNT OVERVIEW & CLEARANCE CARDS (Matching Screenshot) */}
      <div className="adm-profile-group-label" style={{ marginTop: '28px' }}>
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

      {/* SECTION 4: CHANGE PASSWORD */}
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

