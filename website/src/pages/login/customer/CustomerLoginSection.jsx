import React, { useState } from 'react';
import { 
  Cloud, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  LogIn,
  Zap,
  HelpCircle,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '../../../services/authApi';

export default function CustomerLoginSection({ onLoginSuccess, onForgotPassword }) {
  const [clientEmail, setClientEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cloudTenant, setCloudTenant] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientEmail.trim()) {
      setErrorMessage('Please enter your business email or registered customer ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: clientEmail.trim(),
        password,
        portal: 'customer'
      });

      setIsLoading(false);
      onLoginSuccess({
        portal: 'Customer Login',
        role: response.user.tier || 'Enterprise Cloud ERP & Tally Prime Subscriber',
        user: response.user.email || clientEmail,
        accessLevel: 'Dedicated Cloud VPS Environment',
        location: 'CtrlS Tier-4 Datacenter, Kolkata Host Node #04',
        tenantId: response.user.customerId || cloudTenant || 'NIS-CLOUD-AUTO'
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="login-portal-card customer-card animate-fade-in">
      {/* Top Card Header */}
      <div className="portal-card-header">
        <div className="portal-badge-wrap">
          <span className="portal-badge customer-badge">
            <Cloud size={13} />
            <span>Client Cloud &amp; ERP Gateway</span>
          </span>
          <span className="portal-status-dot-wrap">
            <span className="portal-status-dot customer-dot" />
            <span>99.99% Cloud Uptime</span>
          </span>
        </div>

        <h3 className="portal-card-title">Customer Login</h3>
        <p className="portal-card-subtitle">
          Direct cloud access to your multi-user Tally Prime instance, dedicated VPS hosting, and managed IT services.
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
        {/* Customer Email / Account ID Field */}
        <div className="portal-form-group">
          <label htmlFor="customer-email" className="portal-label">
            <span>Corporate Email or Client ID</span>
            <span className="portal-required">*</span>
          </label>
          <div className="portal-input-wrapper">
            <Mail size={17} className="portal-input-icon" />
            <input 
              id="customer-email"
              type="email"
              className="portal-input"
              placeholder="e.g. finance@yourcompany.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="portal-form-group">
          <div className="portal-label-row">
            <label htmlFor="customer-password" className="portal-label">
              <span>Account Password</span>
              <span className="portal-required">*</span>
            </label>
            <button 
              type="button" 
              className="portal-forgot-link"
              onClick={() => onForgotPassword('Customer')}
            >
              Forgot Password?
            </button>
          </div>
          <div className="portal-input-wrapper">
            <Lock size={17} className="portal-input-icon" />
            <input 
              id="customer-password"
              type={showPassword ? 'text' : 'password'}
              className="portal-input"
              placeholder="Enter your cloud account password"
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

        {/* Cloud Instance / Tenant ID (Optional for multi-tenant users) */}
        <div className="portal-form-group">
          <div className="portal-label-row">
            <label htmlFor="customer-tenant" className="portal-label">
              <span>Cloud Server / Tenant Code</span>
              <span className="portal-optional">(Optional)</span>
            </label>
            <span className="portal-tenant-hint">Auto-routed if left blank</span>
          </div>
          <div className="portal-input-wrapper">
            <Server size={17} className="portal-input-icon" />
            <input 
              id="customer-tenant"
              type="text"
              className="portal-input font-mono"
              placeholder="e.g. NIS-CLOUD-9821 or your company slug"
              value={cloudTenant}
              onChange={(e) => setCloudTenant(e.target.value)}
            />
          </div>
        </div>

        {/* Remember Session & Policies */}
        <div className="portal-checkbox-row">
          <label className="portal-checkbox-label">
            <input 
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="portal-checkbox"
            />
            <span>Remember my workspace login on this browser</span>
          </label>
        </div>

        {/* Submit Action */}
        <button 
          type="submit" 
          className="portal-submit-btn customer-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="portal-spinner" />
              <span>Connecting to Secure Cloud VPS...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In to Cloud Workspace</span>
              <ArrowRight size={16} className="btn-arrow" />
            </>
          )}
        </button>

        {/* Security Notice & Customer Resources */}
        <div className="portal-card-footer-notes">
          <div className="portal-note-item">
            <CheckCircle2 size={14} className="portal-note-icon" />
            <span>256-Bit TLS session with daily automated cloud backup</span>
          </div>
          <div className="portal-quick-actions-strip">
            <a 
              href="#client-launcher"
              onClick={(e) => {
                e.preventDefault();
                alert("The NISPL Cloud RDP Launcher shortcut (.rdp / web client) has been initiated. Contact 24/7 IT NOC for your company configuration file.");
              }}
              className="portal-aux-link"
            >
              <Download size={13} />
              <span>Download Desktop Client Shortcut</span>
            </a>
            <span className="portal-bullet-sep">•</span>
            <Link to="/contact" className="portal-aux-link">
              <HelpCircle size={13} />
              <span>24/7 Support Desk</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
