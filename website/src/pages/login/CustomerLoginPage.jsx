import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  UserPlus, 
  ExternalLink,
  Sparkles,
  Server
} from 'lucide-react';
import { authApi } from '../../services/authApi';
import logoImg from '../../assets/NISPL Cloud Tech Logo (2).png';
import './CustomerAuth.css';

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your Customer Email or Customer ID.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.login({
        email: email.trim(),
        password,
        portal: 'customer'
      });
      setIsLoading(false);
      setLoginSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid credentials. Please verify and try again.');
    }
  };

  return (
    <div className="cust-auth-page">
      {/* Header Bar */}
      <header className="cust-auth-header">
        <Link to="/" className="cust-auth-brand" title="Net Infotech System Pvt. Ltd.">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="cust-auth-logo-img"
          />
        </Link>
        <div className="cust-auth-header-actions">
          <Link to="/" className="cust-auth-back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="cust-auth-container">
        <div className="cust-login-card-box">
          
          <div className="cust-portal-badge">
            <Cloud size={14} />
            <span>Customer Cloud Portal</span>
          </div>

          <h1 className="cust-card-title">Existing Customer Login</h1>
          <p className="cust-card-subtitle">
            Sign in to access your cloud instances, remote Tally Prime licenses, and active billing.
          </p>

          {loginSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="cust-success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '8px' }}>
                Authentication Successful
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '20px' }}>
                Welcome back! Connecting you to your dedicated NISPL cloud environment...
              </p>
              <button 
                type="button" 
                className="cust-primary-btn"
                onClick={() => navigate('/customer/dashboard')}
              >
                <span>Continue to Cloud Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form className="cust-form" onSubmit={handleLogin}>
              {errorMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  fontSize: '0.86rem'
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Email / Customer ID */}
              <div className="cust-field-group">
                <label className="cust-field-label" htmlFor="cust-email">
                  Customer Email or Account ID
                  <span className="required-star">*</span>
                </label>
                <div className="cust-input-wrapper">
                  <Mail size={17} className="cust-input-icon" />
                  <input
                    id="cust-email"
                    type="text"
                    className="cust-text-input"
                    placeholder="name@company.com or NIS-CUST-XXXX"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="cust-field-group">
                <label className="cust-field-label" htmlFor="cust-password">
                  Password
                  <span className="required-star">*</span>
                </label>
                <div className="cust-input-wrapper">
                  <Lock size={17} className="cust-input-icon" />
                  <input
                    id="cust-password"
                    type={showPassword ? 'text' : 'password'}
                    className="cust-text-input"
                    placeholder="Enter your customer password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="cust-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="cust-form-row-remember">
                <label className="cust-remember-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
                <a 
                  href="#forgot" 
                  className="cust-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions will be sent to your registered company email.');
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="cust-primary-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Customer Portal</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="cust-auth-divider">
                <span>OR</span>
              </div>

              {/* Create An Account Section */}
              <div className="cust-create-account-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <UserPlus size={18} color="#38BDF8" />
                  <h4 className="cust-create-title">New to NISPL Cloud?</h4>
                </div>
                <p className="cust-create-desc">
                  Set up your company profile, choose your subscription plan, and configure installation dates.
                </p>
                <Link to="/customer-register" className="cust-create-btn">
                  <span>Create an Account</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </form>
          )}

          {/* Security badge at bottom */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '22px',
            fontSize: '0.78rem',
            color: '#64748B'
          }}>
            <ShieldCheck size={14} color="#38BDF8" />
            <span>256-Bit SSL Encrypted Enterprise Gateway</span>
          </div>

        </div>
      </main>
    </div>
  );
}
