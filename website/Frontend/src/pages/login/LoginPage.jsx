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
  Sparkles,
  Shield,
  Handshake
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

  // If already authenticated with a valid token, redirect to active portal dashboard
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      const user = authApi.getCurrentUser();
      const currentRole = user?.role;
      if (currentRole === 'customer' && (activePortal === 'customer' || location.pathname === '/customer-login')) {
        navigate('/customer/overview', { replace: true });
      } else if (['admin', 'manager', 'support'].includes(currentRole) && activePortal === 'admin') {
        navigate('/admin/overview', { replace: true });
      } else if (currentRole === 'partner' && activePortal === 'partner') {
        navigate('/partner-dashboard', { replace: true });
      }
    }
  }, [activePortal, location.pathname, navigate]);

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

  // Check if an admin has already been created (hides create admin option once 1 admin exists)
  const [adminConfigLoaded, setAdminConfigLoaded] = useState(false);
  const [adminExists, setAdminExists] = useState(() => {
    try {
      const cached = localStorage.getItem('nispl_admin_exists');
      return cached !== null ? cached === 'true' : true; // Default to true (hidden) to prevent flash
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let isMounted = true;
    authApi.getAdminConfig()
      .then(res => {
        if (isMounted) {
          if (typeof res?.adminExists === 'boolean') {
            setAdminExists(res.adminExists);
            try {
              localStorage.setItem('nispl_admin_exists', res.adminExists ? 'true' : 'false');
            } catch (e) {
              // ignore
            }
          }
          setAdminConfigLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to verify admin status:', err);
        if (isMounted) setAdminConfigLoaded(true);
      });
    return () => { isMounted = false; };
  }, []);

  // Form Fields State: ONLY Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Modals state
  const [activeSession, setActiveSession] = useState(null);
  const [isForgotOpen, setIsForgotOpen] = useState(() => searchParams.get('forgot') === 'true');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  // Social sign-in notice (providers are not connected to the backend yet)
  const [socialNote, setSocialNote] = useState('');

  useEffect(() => {
    if (!socialNote) return undefined;
    const timer = setTimeout(() => setSocialNote(''), 6000);
    return () => clearTimeout(timer);
  }, [socialNote]);

  const handleSocialSignIn = (provider) => {
    setSocialNote(
      `${provider} sign-in is not enabled for this workspace yet. Please continue with your email and password.`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email or account ID.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        identifier: email.trim(),
        email: email.trim(),
        password,
        portal: activePortal
      });

      setIsLoading(false);

      const userRole = response?.user?.role || response?.role;

      if (userRole === 'customer') {
        navigate('/customer/overview');
        return;
      }

      if (['admin', 'manager', 'support'].includes(userRole)) {
        navigate('/admin/overview');
        return;
      }

      if (userRole === 'partner') {
        navigate('/partner-dashboard');
        return;
      }

      setActiveSession({
        portal: activePortal === 'admin' ? 'NISPL Admin Login' : 'Partners Login',
        user: response.user.email || email,
        name: response.user.name,
        role: response.user.tier || 'Authorized User',
        clearance: activePortal === 'admin' ? 'Tier-1 Root Security Clearance' : 'Certified Partner Tier-Gold',
        location: activePortal === 'admin' ? 'Kolkata Primary Cloud NOC Node' : 'Eastern India Channel Hub'
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }
    setIsSendingReset(true);
    try {
      const response = await authApi.forgotPassword(resetEmail.trim());
      setIsSendingReset(false);
      setResetSent(true);
      if (response.devResetUrl) {
        setDevResetUrl(response.devResetUrl);
      }
    } catch (err) {
      setIsSendingReset(false);
      setResetError(err.message || 'Failed to dispatch reset instructions. Please verify your email.');
    }
  };

  // If authenticated, render full Header + Sidebar Enterprise Dashboard
  if (activeSession) {
    if (activePortal === 'partner') {
      return (
        <PartnerDashboard 
          userSession={activeSession} 
          onSignOut={() => {
            authApi.clearAuthSession();
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
            authApi.clearAuthSession();
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
        <div className={`ebolt-login-card animate-fade-in ${isShaking ? 'ebolt-shake' : ''}`}>
          
          {/* Top Floating Action Icon Badge: ->] */}
          <div className="ebolt-badge-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>

          {/* Heading and Description */}
          <h1 className="ebolt-card-title">Sign in with email</h1>
          <p className="ebolt-card-subtitle">
            {activePortal === 'customer' || location.pathname === '/customer-login'
              ? 'Access your cloud instances, remote Tally licenses & support.'
              : activePortal === 'partner'
                ? 'Access your partner deal desk, payouts and enablement.'
                : 'Access the NISPL operations console.'}
          </p>

          {/* Error Notice */}
          {errorMessage && (
            <div className="ebolt-alert-error is-stacked" role="alert">
              <div className="ebolt-alert-error-row">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes('Customer Portal') && (
                <button
                  type="button"
                  className="ebolt-error-action-btn"
                  onClick={() => {
                    setErrorMessage('');
                    handleSelectPortal('customer');
                    navigate('/customer-login');
                  }}
                >
                  Go to Customer Portal &rarr;
                </button>
              )}
              {errorMessage.includes('Admin Portal') && (
                <button
                  type="button"
                  className="ebolt-error-action-btn"
                  onClick={() => {
                    setErrorMessage('');
                    handleSelectPortal('admin');
                    navigate('/login?portal=admin');
                  }}
                >
                  Go to Admin Portal &rarr;
                </button>
              )}
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

            {/* Dark Primary Action Button */}
            <button 
              type="submit" 
              className="ebolt-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="ebolt-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            {socialNote && (
              <p className="ebolt-social-note" role="status">{socialNote}</p>
            )}

            {/* Create Admin Option (Shown for Admin Login ONLY when no admin has been created yet) */}
            {activePortal === 'admin' && adminConfigLoaded && !adminExists && (
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
                  {activePortal === 'admin' ? <Shield size={20} /> : activePortal === 'partner' ? <Handshake size={20} /> : <Cloud size={20} />}
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
                <span className="ebolt-dialog-sub">Enter your email to receive recovery instructions</span>
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => {
                  setIsForgotOpen(false);
                  setResetError('');
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              {resetSent ? (
                <div className="reset-sent-state">
                  <CheckCircle2 size={38} className="text-green" style={{ margin: '0 auto 12px' }} />
                  <h4>Check your inbox</h4>
                  <p>If an account is associated with <b>{resetEmail}</b>, password recovery instructions have been dispatched.</p>
                  
                  {devResetUrl && (
                    <div style={{ margin: '16px 0', padding: '12px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px dashed #22c55e', fontSize: '0.82rem', textAlign: 'left' }}>
                      <span style={{ fontWeight: 600, color: '#15803d' }}>Local Dev Reset Link:</span>
                      <div style={{ marginTop: '6px' }}>
                        <Link 
                          to={devResetUrl.replace(/^https?:\/\/[^/]+/, '')} 
                          onClick={() => setIsForgotOpen(false)}
                          style={{ color: '#0284c7', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: 500 }}
                        >
                          Open Password Reset Page &rarr;
                        </Link>
                      </div>
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="ebolt-submit-btn" 
                    style={{ marginTop: '16px' }}
                    onClick={() => {
                      setIsForgotOpen(false);
                      setResetSent(false);
                      setResetError('');
                      setDevResetUrl('');
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendReset} noValidate>
                  {resetError && (
                    <div className="ebolt-alert-error" role="alert" style={{ marginBottom: '14px' }}>
                      <AlertCircle size={15} />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="ebolt-input-wrap">
                    <Mail size={16} className="ebolt-input-icon" />
                    <input 
                      type="email"
                      className="ebolt-input"
                      placeholder="Enter registered email address"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetError) setResetError('');
                      }}
                      autoComplete="email"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="ebolt-dialog-footer" style={{ padding: 0, marginTop: '20px' }}>
                    <button 
                      type="button" 
                      className="ebolt-btn-outline"
                      onClick={() => {
                        setIsForgotOpen(false);
                        setResetError('');
                      }}
                      disabled={isSendingReset}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="ebolt-btn-solid"
                      disabled={isSendingReset || !resetEmail.trim()}
                    >
                      {isSendingReset ? (
                        <span className="ebolt-spinner" />
                      ) : (
                        <span>Send Reset Link</span>
                      )}
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

/* ==========================================================================
   Social provider marks (inline SVG so they render without extra assets)
   ========================================================================== */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
