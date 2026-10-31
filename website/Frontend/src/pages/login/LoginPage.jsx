import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import PartnerDashboard from './partner/PartnerDashboard';
import AdminDashboard from './Admin/AdminDashboard';
import { authApi } from '../../services/authApi';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Users, 
  Cloud, 
  ChevronDown,
  X, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ lockedPortal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlPortal = searchParams.get('portal');

  // Portal selection is locked/uneditable if selected from navbar (?portal=admin/customer/partner) or via lockedPortal prop or /customer-login route
  const isPortalLocked = Boolean(
    lockedPortal || 
    urlPortal === 'admin' || 
    urlPortal === 'partner' || 
    urlPortal === 'customer' || 
    location.pathname === '/customer-login' || 
    searchParams.get('locked') === 'true'
  );

  // Determine active portal: 'admin' | 'partner' | 'customer'
  const getInitialPortal = () => {
    if (lockedPortal) return lockedPortal;
    if (location.pathname === '/customer-login') return 'customer';
    if (urlPortal === 'partner') return 'partner';
    if (urlPortal === 'customer') return 'customer';
    if (urlPortal === 'admin') return 'admin';
    return 'admin';
  };

  const [activePortal, setActivePortal] = useState(getInitialPortal);

  useEffect(() => {
    if (lockedPortal) {
      setActivePortal(lockedPortal);
    } else if (location.pathname === '/customer-login') {
      setActivePortal('customer');
    } else if (urlPortal && ['admin', 'partner', 'customer'].includes(urlPortal)) {
      setActivePortal(urlPortal);
    }
  }, [lockedPortal, location.pathname, urlPortal]);

  const handleSelectPortal = (portalKey) => {
    if (isPortalLocked) return;
    if (portalKey === 'partner') {
      navigate('/partner-dashboard');
      return;
    }
    setActivePortal(portalKey);
    setSearchParams({ portal: portalKey });
    setErrorMessage('');
  };

  // Form Fields State: ONLY Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals state
  const [activeSession, setActiveSession] = useState(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email or account ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
        portal: activePortal
      });

      setIsLoading(false);

      if (activePortal === 'customer') {
        navigate('/customer/dashboard');
        return;
      }

      if (activePortal === 'admin') {
        navigate('/admin/overview');
        return;
      }

      setActiveSession({
        portal: activePortal === 'admin' ? 'NISPL Admin Login' : 'Partners Login',
        user: response.user.email || email,
        name: response.user.name,
        role: response.user.tier || 'Authorized User',
        clearance: activePortal === 'admin' ? 'Tier-1 Root Security Clearance' : 'Certified Partner Tier-Gold',
        location: activePortal === 'admin' ? 'CtrlS Kolkata Rated-4 Primary NOC Node' : 'Eastern India Channel Hub'
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      await authApi.forgotPassword(resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch reset instructions.');
    }
  };

  // If authenticated, render full Header + Sidebar Enterprise Dashboard
  if (activeSession) {
    if (activePortal === 'partner') {
      return (
        <PartnerDashboard 
          userSession={activeSession} 
          onSignOut={() => {
            setActiveSession(null);
            setPassword('');
            setErrorMessage('');
          }} 
        />
      );
    }
    if (activePortal === 'admin') {
      return (
        <AdminDashboard 
          userSession={activeSession} 
          onSignOut={() => {
            setActiveSession(null);
            setPassword('');
            setErrorMessage('');
          }} 
        />
      );
    }
  }

  return (
    <div className="ebolt-login-viewport">
      {/* Top Bar: Official Brand Logo & Back Link */}
      <header className="ebolt-top-nav">
        <Link to="/" className="ebolt-brand-link" title="Net Infotech System Pvt. Ltd.">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="ebolt-brand-logo-img" 
            height="48"
          />
        </Link>

        <Link to="/" className="ebolt-home-pill-btn">
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Centered Frosted Glass Card */}
      <main className="ebolt-login-wrapper">
        <div className="ebolt-login-card animate-fade-in">
          
          {/* Top Floating Action Icon Badge: ->] */}
          <div className="ebolt-badge-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>

          {/* Heading and Description */}
          <h1 className="ebolt-card-title">
            {activePortal === 'customer' || location.pathname === '/customer-login'
              ? 'Login'
              : activePortal === 'admin'
              ? 'Login'
              : 'Login'}
          </h1>
          <p className="ebolt-card-subtitle">
            {activePortal === 'customer' || location.pathname === '/customer-login'
              ? 'Access your cloud instances, remote Tally licenses & support.'
              : 'Make a new doc to bring your words, data, and teams together. For free'}
          </p>

          {/* Error Notice */}
          {errorMessage && (
            <div className="ebolt-alert-error" role="alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Form: ONLY Selection Dropdown, Email, and Password */}
          <form onSubmit={handleSubmit} className="ebolt-form" noValidate>
            
            {/* Selection Dropdown for the 3 Login Sections */}
            <div className={`ebolt-input-wrap ebolt-select-wrap ${isPortalLocked ? 'is-locked-wrap' : ''}`}>
              <div className="ebolt-input-icon">
                {activePortal === 'admin' ? (
                  <ShieldCheck size={16} />
                ) : activePortal === 'partner' ? (
                  <Users size={16} />
                ) : (
                  <Cloud size={16} />
                )}
              </div>
              <select 
                className={`ebolt-input ebolt-select ${isPortalLocked ? 'ebolt-select-locked' : ''}`}
                value={activePortal}
                onChange={(e) => handleSelectPortal(e.target.value)}
                disabled={isPortalLocked}
                title={isPortalLocked ? `${activePortal === 'admin' ? 'Admin' : activePortal === 'customer' ? 'Customer' : 'Partner'} Login is locked based on navbar selection` : 'Select Login Portal'}
                aria-label="Select Login Portal"
              >
                <option value="admin">NISPL Admin Login</option>
                <option value="partner">Partners Login</option>
                <option value="customer">Customer Login</option>
              </select>
              {!isPortalLocked && <ChevronDown size={16} className="ebolt-select-chevron" />}
            </div>

            {/* Email Input */}
            <div className="ebolt-input-wrap">
              <Mail size={16} className="ebolt-input-icon" />
              <input 
                type="email"
                className="ebolt-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Password Input */}
            <div className="ebolt-input-wrap">
              <Lock size={16} className="ebolt-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="ebolt-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button 
                type="button" 
                className="ebolt-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot Password Right Link */}
            <div className="ebolt-forgot-row">
              <button 
                type="button" 
                className="ebolt-forgot-btn"
                onClick={() => {
                  setIsForgotOpen(true);
                  setResetSent(false);
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Dark Primary Action Button: "Get Started" */}
            <button 
              type="submit" 
              className="ebolt-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="ebolt-spinner" />
              ) : (
                <span>Get Started</span>
              )}
            </button>

            {/* Create Admin Option (Shown for Admin Login - matches user request) */}
            {activePortal === 'admin' && (
              <div className="ebolt-create-account-box animate-fade-in">
                <span className="ebolt-create-account-text">Are you a new administrator? </span>
                <Link to="/admin/create" className="ebolt-create-account-link">
                  Create Admin
                </Link>
              </div>
            )}

            {/* Create an Account Option (Shown ONLY for Customer Login) */}
            {activePortal === 'customer' && (
              <div className="ebolt-create-account-box animate-fade-in">
                <span className="ebolt-create-account-text">Don't have an account? </span>
                <Link to="/customer-register" className="ebolt-create-account-link">
                  Create an account
                </Link>
              </div>
            )}
          </form>

        </div>
      </main>

      {/* =====================================================================
          AUTHENTICATED MODAL (Matches sleek aesthetic)
          ===================================================================== */}
      {activeSession && (
        <div className="ebolt-modal-backdrop" onClick={() => setActiveSession(null)}>
          <div className="ebolt-dialog-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="ebolt-dialog-header">
              <div className="ebolt-dialog-check">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="ebolt-dialog-title">Authenticated Successfully</h3>
                <span className="ebolt-dialog-sub">{activeSession.portal} Gateway</span>
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => setActiveSession(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              <div className="ebolt-session-user-box">
                <span className="ebolt-user-icon">
                  {activePortal === 'admin' ? '🛡️' : activePortal === 'partner' ? '🤝' : '☁️'}
                </span>
                <div>
                  <span className="ebolt-user-email">{activeSession.user}</span>
                  <span className="ebolt-user-role">{activeSession.role}</span>
                </div>
              </div>

              <div className="ebolt-session-specs">
                <div className="spec-row">
                  <span className="s-lbl">Security Level:</span>
                  <span className="s-val text-blue">{activeSession.clearance}</span>
                </div>
                <div className="spec-row">
                  <span className="s-lbl">Node:</span>
                  <span className="s-val">{activeSession.location}</span>
                </div>
                <div className="spec-row">
                  <span className="s-lbl">Encryption:</span>
                  <span className="s-val text-green">256-Bit TLS 1.3 Active</span>
                </div>
              </div>

              <div className="ebolt-dialog-note">
                <Sparkles size={15} />
                <span>Zero-Trust Enterprise Identity Verified. Ready for workspace redirection.</span>
              </div>
            </div>

            <div className="ebolt-dialog-footer">
              <button 
                type="button" 
                className="ebolt-btn-outline"
                onClick={() => setActiveSession(null)}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
              <button 
                type="button" 
                className="ebolt-btn-solid"
                onClick={() => {
                  alert(`Launching ${activeSession.portal} live cloud instance...`);
                  setActiveSession(null);
                }}
              >
                <span>Launch Workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FORGOT PASSWORD MODAL
          ===================================================================== */}
      {isForgotOpen && (
        <div className="ebolt-modal-backdrop" onClick={() => setIsForgotOpen(false)}>
          <div className="ebolt-dialog-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="ebolt-dialog-header">
              <div>
                <h3 className="ebolt-dialog-title">Reset password</h3>
                <span className="ebolt-dialog-sub">Enter your email to receive a recovery link</span>
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => setIsForgotOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              {resetSent ? (
                <div className="reset-sent-state">
                  <CheckCircle2 size={36} className="text-green" style={{ margin: '0 auto 12px' }} />
                  <h4>Check your inbox</h4>
                  <p>A secure reset token has been dispatched to <b>{resetEmail || 'your email'}</b>.</p>
                  <button 
                    type="button" 
                    className="ebolt-submit-btn" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setIsForgotOpen(false)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendReset}>
                  <div className="ebolt-input-wrap">
                    <Mail size={16} className="ebolt-input-icon" />
                    <input 
                      type="email"
                      className="ebolt-input"
                      placeholder="Enter registered email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ebolt-dialog-footer" style={{ padding: 0, marginTop: '20px' }}>
                    <button 
                      type="button" 
                      className="ebolt-btn-outline"
                      onClick={() => setIsForgotOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="ebolt-btn-solid"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
