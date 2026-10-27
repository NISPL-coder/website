import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint,
  Zap,
  HelpCircle
} from 'lucide-react';

import { authApi } from '../../services/authApi';

export default function AdminLoginSection({ onLoginSuccess, onForgotPassword }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminEmail.trim()) {
      setErrorMessage('Please enter your administrator email or employee ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your master password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: adminEmail.trim(),
        password,
        portal: 'admin'
      });

      setIsLoading(false);
      onLoginSuccess({
        portal: 'NISPL Admin',
        role: response.user.tier || 'Infrastructure & NOC Systems Administrator',
        user: response.user.email || adminEmail,
        accessLevel: 'Tier-1 Root Security Clearance',
        location: 'Salt Lake Sector V, Kolkata NOC'
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="login-portal-card admin-card animate-fade-in">
      {/* Top Card Header */}
      <div className="portal-card-header">
        <div className="portal-badge-wrap">
          <span className="portal-badge admin-badge">
            <ShieldCheck size={13} />
            <span>Tier-1 Internal Access</span>
          </span>
          <span className="portal-status-dot-wrap">
            <span className="portal-status-dot" />
            <span>NOC Live</span>
          </span>
        </div>

        <h3 className="portal-card-title">Login</h3>
        <p className="portal-card-subtitle">
          Internal management console for infrastructure engineers, network administrators, and executive leadership.
        </p>
      </div>

      {errorMessage && (
        <div className="portal-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="portal-form" noValidate>
        {/* Email / ID Field */}
        <div className="portal-form-group">
          <label htmlFor="admin-email" className="portal-label">
            <span>Administrator Email / Employee ID</span>
            <span className="portal-required">*</span>
          </label>
          <div className="portal-input-wrapper">
            <Mail size={17} className="portal-input-icon" />
            <input 
              id="admin-email"
              type="email"
              className="portal-input"
              placeholder="e.g. admin@netinfotechsystem.in"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Master Password Field */}
        <div className="portal-form-group">
          <div className="portal-label-row">
            <label htmlFor="admin-password" className="portal-label">
              <span>Master Security Password</span>
              <span className="portal-required">*</span>
            </label>
            <button 
              type="button" 
              className="portal-forgot-link"
              onClick={() => onForgotPassword('NISPL Admin')}
            >
              Reset Key?
            </button>
          </div>
          <div className="portal-input-wrapper">
            <Lock size={17} className="portal-input-icon" />
            <input 
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              className="portal-input"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button 
              type="button" 
              className="portal-toggle-pwd"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication PIN */}
        <div className="portal-form-group">
          <div className="portal-label-row">
            <label htmlFor="admin-2fa" className="portal-label">
              <span>2FA Security Token / PIN</span>
              <span className="portal-badge-mini">Hardware / Authenticator</span>
            </label>
          </div>
          <div className="portal-input-wrapper">
            <KeyRound size={17} className="portal-input-icon" />
            <input 
              id="admin-2fa"
              type="text"
              maxLength={6}
              className="portal-input font-mono"
              placeholder="6-digit code (e.g. 749201)"
              value={twoFactorPin}
              onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        {/* Remember Session & Policy */}
        <div className="portal-checkbox-row">
          <label className="portal-checkbox-label">
            <input 
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="portal-checkbox"
            />
            <span>Keep secure session active for 12 hours</span>
          </label>
        </div>

        {/* Submit Action */}
        <button 
          type="submit" 
          className="portal-submit-btn admin-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="portal-spinner" />
              <span>Verifying Clearance &amp; Token...</span>
            </>
          ) : (
            <>
              <Fingerprint size={18} />
              <span>Authenticate to Admin Console</span>
              <ArrowRight size={16} className="btn-arrow" />
            </>
          )}
        </button>

        {/* Security Notice Footer */}
        <div className="portal-card-footer-notes">
          <div className="portal-note-item">
            <CheckCircle2 size={14} className="portal-note-icon" />
            <span>Zero-Trust Network Access (ZTNA) enforced</span>
          </div>
          <div className="portal-note-item">
            <HelpCircle size={14} className="portal-note-icon" />
            <span>IP address logged for compliance audit</span>
          </div>
        </div>
      </form>
    </div>
  );
}
