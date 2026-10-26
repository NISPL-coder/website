import React, { useState } from 'react';
import { 
  Users, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnerLoginSection({ onLoginSuccess, onForgotPassword }) {
  const [partnerId, setPartnerId] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('odisha-eastern');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1-Click Fast Demo Autofill
  const handleAutofillDemo = () => {
    setPartnerId('PTR-NISPL-8920');
    setPassword('TallyPartner$2026');
    setRegion('kolkata-hq');
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!partnerId.trim()) {
      setErrorMessage('Please enter your Partner ID or registered corporate email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your Partner password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        portal: 'Partners Login',
        role: 'Authorized Tally & Cloud Solutions Channel Partner',
        user: partnerId,
        accessLevel: 'Certified Partner Tier-Gold',
        location: region === 'kolkata-hq' ? 'Kolkata HQ & West Bengal' : 'Odisha & Eastern India Region'
      });
    }, 900);
  };

  return (
    <div className="login-portal-card partner-card animate-fade-in">
      {/* Top Card Header */}
      <div className="portal-card-header">
        <div className="portal-badge-wrap">
          <span className="portal-badge partner-badge">
            <Users size={13} />
            <span>Authorized Channel Network</span>
          </span>
          <span className="portal-status-dot-wrap">
            <span className="portal-status-dot partner-dot" />
            <span>Partner Hub Online</span>
          </span>
        </div>

        <h3 className="portal-card-title">Partners Login</h3>
        <p className="portal-card-subtitle">
          Dedicated gateway for certified Tally solution providers, enterprise resellers, and regional IT associates.
        </p>

        {/* Quick Demo Pre-fill Pill */}
        <button 
          type="button" 
          className="portal-demo-autofill-btn"
          onClick={handleAutofillDemo}
          title="Click to fill sample credentials for instant testing"
        >
          <Zap size={13} />
          <span>Autofill Demo Partner Credentials</span>
        </button>
      </div>

      {errorMessage && (
        <div className="portal-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="portal-form" noValidate>
        {/* Partner ID / Email Field */}
        <div className="portal-form-group">
          <label htmlFor="partner-id" className="portal-label">
            <span>Partner ID or Business Email</span>
            <span className="portal-required">*</span>
          </label>
          <div className="portal-input-wrapper">
            <Mail size={17} className="portal-input-icon" />
            <input 
              id="partner-id"
              type="text"
              className="portal-input"
              placeholder="e.g. PTR-NISPL-8920 or partner@domain.com"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Master Password Field */}
        <div className="portal-form-group">
          <div className="portal-label-row">
            <label htmlFor="partner-password" className="portal-label">
              <span>Partner Access Key / Password</span>
              <span className="portal-required">*</span>
            </label>
            <button 
              type="button" 
              className="portal-forgot-link"
              onClick={() => onForgotPassword('Partners')}
            >
              Forgot Key?
            </button>
          </div>
          <div className="portal-input-wrapper">
            <Lock size={17} className="portal-input-icon" />
            <input 
              id="partner-password"
              type={showPassword ? 'text' : 'password'}
              className="portal-input"
              placeholder="Enter partner access key"
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

        {/* Territory / Regional Node Selector */}
        <div className="portal-form-group">
          <label htmlFor="partner-region" className="portal-label">
            <span>Authorized Territory / Zone</span>
          </label>
          <div className="portal-input-wrapper">
            <Globe2 size={17} className="portal-input-icon" />
            <select 
              id="partner-region"
              className="portal-input portal-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="odisha-eastern">Odisha &amp; Eastern India Hub</option>
              <option value="kolkata-hq">Kolkata HQ &amp; West Bengal</option>
              <option value="bihar-jharkhand">Bihar &amp; Jharkhand Circle</option>
              <option value="pan-india">Pan-India Corporate Accounts</option>
            </select>
          </div>
        </div>

        {/* Remember Session & Policies */}
        <div className="portal-checkbox-row">
          <label className="portal-checkbox-label">
            <input 
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="portal-checkbox"
            />
            <span>Remember this device for 30 days</span>
          </label>
        </div>

        {/* Submit Action */}
        <button 
          type="submit" 
          className="portal-submit-btn partner-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="portal-spinner" />
              <span>Verifying Partner Credentials...</span>
            </>
          ) : (
            <>
              <Briefcase size={18} />
              <span>Sign In to Partner Portal</span>
              <ArrowRight size={16} className="btn-arrow" />
            </>
          )}
        </button>

        {/* Security Notice & Partner Onboarding */}
        <div className="portal-card-footer-notes">
          <div className="portal-note-item">
            <CheckCircle2 size={14} className="portal-note-icon" />
            <span>Instant access to Tally license quotas &amp; commission margins</span>
          </div>
          <div className="portal-bottom-link-row">
            <span>Not an enrolled partner yet?</span>
            <Link to="/contact" className="portal-highlight-link">
              <span>Apply for Channel Partnership</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
