import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, KeyRound, Server, UserCog, Loader2, BadgeCheck,
  CalendarDays, Clock3, Fingerprint, Layers, Lock, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { authApi } from '../../../services/authApi';
import { describePermissions } from './PermissionsContext';
import toast from 'react-hot-toast';
import './AdminTools.css';

const PORTAL_NAME = 'NISPL Admin Console';
const SIGN_IN_METHOD = 'Email & Password';

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
    .join('');

export default function ProfilePage({ adminName, adminEmail, portalName = PORTAL_NAME }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwVisibility, setPwVisibility] = useState({ current: false, next: false, confirm: false });
  const [isChangingPw, setIsChangingPw] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const user = await authApi.getProfile();
      setProfile(user);
    } catch (err) {
      setLoadError(err.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const name = profile?.name || adminName || '';
  const email = profile?.email || adminEmail || '';
  const role = String(profile?.role || '').toLowerCase() === 'admin'
    ? 'Primary Admin'
    : capitalize(profile?.role);
  const accountStatus = profile?.accountStatus || 'active';

  const isStaffAccount = ['admin', 'manager', 'support'].includes(
    String(profile?.role || '').toLowerCase()
  );

  const accountItems = [
    { label: 'Portal Access', value: portalName, icon: ShieldCheck },
    { label: 'Role', value: role, icon: UserCog },
    { label: 'Designation', value: profile?.designation || '—', icon: BadgeCheck },
    { label: 'Server Region / Location', value: profile?.location || '—', icon: Server },
    { label: 'Service Tier', value: profile?.tier || '—', icon: Layers },
    { label: 'Member Since', value: formatDate(profile?.createdAt), icon: CalendarDays }
  ];

  const securityItems = [
    { label: 'Account Status', value: capitalize(profile?.accountStatus), icon: ShieldCheck },
    { label: 'Security Clearance', value: profile?.securityLevel || '—', icon: Fingerprint },
    { label: 'Sign-In Method', value: SIGN_IN_METHOD, icon: KeyRound },
    { label: 'Last Sign-In', value: formatDateTime(profile?.lastLoginAt), icon: Clock3 },
    // Module grants only mean something for console staff accounts.
    ...(isStaffAccount
      ? [{ label: 'Granted Permissions', value: describePermissions(profile), icon: UserCog }]
      : [])
  ];

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
      toast.error('New password must be different from the current password.');
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
      toast.success('Password changed. Please sign in again.', { id: toastId });
      authApi.clearAuthSession();
      setTimeout(() => {
        window.location.href = '/login?portal=admin';
      }, 800);
    } catch (err) {
      toast.error(err.message, { id: toastId });
      setIsChangingPw(false);
    }
  };

  const renderItems = (items) =>
    items.map((item) => (
      <div key={item.label} className="adm-profile-info-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <item.icon size={13} color="#6366f1" />
          <div className="adm-profile-info-label" style={{ marginBottom: 0 }}>{item.label}</div>
        </div>
        <div className="adm-profile-info-value">{item.value}</div>
      </div>
    ));

  if (isLoading) {
    return (
      <div className="adm-table-card animate-fade-in">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h1 className="adm-section-title">Admin Profile</h1>
            <p className="adm-section-sub">Loading your profile from the server…</p>
          </div>
        </div>
        <div className="admin-datatable-loading" style={{ padding: '60px 40px' }}>
          <Loader2 size={22} className="admin-datatable-spinner" />
          <span>Fetching profile…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="adm-table-card animate-fade-in">
        <div className="adm-card-header">
          <div className="adm-card-header-info">
            <h1 className="adm-section-title">Admin Profile</h1>
            <p className="adm-section-sub">Your profile could not be loaded.</p>
          </div>
        </div>
        <div className="admin-datatable-empty" style={{ padding: '60px 20px' }}>
          <span className="admin-datatable-empty-icon">
            <ShieldCheck size={22} />
          </span>
          <div className="admin-datatable-empty-title">{loadError}</div>
          <div className="admin-datatable-empty-hint">Check your connection and try again.</div>
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
      <label className="adm-profile-info-label" htmlFor={`adm-pw-${key}`}>{label}</label>
      <div className="adm-profile-pw-input-wrap">
        <input
          id={`adm-pw-${key}`}
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
    <div className="adm-table-card animate-fade-in">
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Admin Profile</h1>
          <p className="adm-section-sub">
            Your identity, access clearance and session details for the {PORTAL_NAME}.
          </p>
        </div>
      </div>

      <div className="adm-profile-hero" style={{ marginTop: '14px' }}>
        <span className="adm-profile-hero-avatar">{initialsOf(name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="adm-profile-hero-name">{name}</h2>
          <p className="adm-profile-hero-email">{email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="adm-profile-role-pill">{role}</span>
            <span className={`adm-profile-status-pill ${accountStatus}`}>
              <ShieldCheck size={12} />
              <span>{capitalize(accountStatus)} Account</span>
            </span>
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

      <div className="adm-profile-group-label">Account Information</div>
      <div className="adm-profile-info-grid">{renderItems(accountItems)}</div>

      <div className="adm-profile-group-label">Security &amp; Access</div>
      <div className="adm-profile-info-grid">{renderItems(securityItems)}</div>

      <div className="adm-profile-group-label">Change Password</div>
      <div className="adm-profile-pw-card">
        <div className="adm-profile-pw-head">
          <span className="adm-profile-pw-head-icon"><Lock size={16} /></span>
          <div>
            <div className="adm-profile-pw-head-title">Update your password</div>
            <div className="adm-profile-pw-head-sub">
              Minimum 10 characters. Changing your password signs out all active sessions.
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
              className="adm-btn-primary"
              disabled={isChangingPw}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isChangingPw ? <Loader2 size={15} className="adm-spinner" /> : <KeyRound size={15} />}
              <span>{isChangingPw ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
