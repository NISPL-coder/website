import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import onboardingVideo from '../../assets/Net Infotech System (NISPL) _ Tally 3-Star Partner, Cloud Hosting, IT Infrastructure & Cybersecurity.mp4';
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
  Handshake,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  Zap
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ lockedPortal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlPortal = searchParams.get('portal');

  // Video playback controls (for customer portal)
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Portal selection is locked/uneditable if selected from navbar (?portal=admin/customer/partner) or via lockedPortal prop or /customer-login route
  const isPortalLocked = Boolean(
    lockedPortal ||
    urlPortal === 'admin' ||
    urlPortal === 'partner' ||
    urlPortal === 'customer' ||
    location.pathname === '/customer-login' ||
    location.pathname === '/customer_login' ||
    searchParams.get('locked') === 'true'
  );

  // Determine active portal: 'admin' | 'partner' | 'customer'
  const getInitialPortal = () => {
    if (lockedPortal) return lockedPortal;
    if (location.pathname === '/customer-login' || location.pathname === '/customer_login' || location.pathname === '/customer/login') return 'customer';
    if (urlPortal === 'customer') return 'customer';
    if (urlPortal === 'partner') return 'partner';
    if (urlPortal === 'admin') return 'admin';
    return 'admin';
  };

  const [activePortal, setActivePortal] = useState(getInitialPortal);

  useEffect(() => {
    if (lockedPortal) {
      setActivePortal(lockedPortal);
    } else if (location.pathname === '/customer-login' || location.pathname === '/customer_login' || location.pathname === '/customer/login') {
      setActivePortal('customer');
    } else if (urlPortal && ['admin', 'partner', 'customer'].includes(urlPortal)) {
      setActivePortal(urlPortal);
    }
  }, [lockedPortal, location.pathname, urlPortal]);

  // If already authenticated with a valid token, redirect to active portal dashboard
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (authApi.isAuthenticated()) {
        const user = authApi.getCurrentUser();
        const currentRole = user?.role;
        if (currentRole === 'customer' && (activePortal === 'customer' || location.pathname.includes('customer'))) {
          navigate('/customer/overview', { replace: true });
        } else if (['admin', 'manager', 'support'].includes(currentRole) && activePortal === 'admin') {
          navigate('/admin/overview', { replace: true });
        } else if (currentRole === 'partner' && activePortal === 'partner') {
          navigate('/partner-dashboard', { replace: true });
        }
      }
    };

    checkAuthAndRedirect();
    window.addEventListener('nispl_auth_change', checkAuthAndRedirect);
    return () => {
      window.removeEventListener('nispl_auth_change', checkAuthAndRedirect);
    };
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
      return cached !== null ? cached === 'true' : true;
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

  // Remember Me & Email persistence keys
  const REMEMBER_KEY = 'nispl_customer_remember_me';
  const REMEMBERED_EMAIL_KEY = 'nispl_customer_remembered_email';

  // Form Fields State (initialized dynamically based on remembered preferences)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [email, setEmail] = useState(() => {
    try {
      const isRemembered = localStorage.getItem(REMEMBER_KEY) === 'true';
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      return (isRemembered && savedEmail) ? savedEmail : '';
    } catch {
      return '';
    }
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [socialNote, setSocialNote] = useState('');

  // Handle dynamic Remember Me toggle
  const handleRememberMeToggle = (checked) => {
    setRememberMe(checked);
    try {
      if (checked) {
        localStorage.setItem(REMEMBER_KEY, 'true');
        if (email.trim()) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        }
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (e) {
      console.warn('Could not store remember me preference:', e);
    }
  };

  // Handle email changes (updates remembered email if Remember Me is active)
  const handleEmailChange = (newVal) => {
    setEmail(newVal);
    if (rememberMe) {
      try {
        if (newVal.trim()) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, newVal.trim());
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch (e) {
        // ignore
      }
    }
  };

  // Modals state
  const [activeSession, setActiveSession] = useState(null);
  const [isForgotOpen, setIsForgotOpen] = useState(() => searchParams.get('forgot') === 'true');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  // Social sign-in placeholder handler
  const handleSocialSignIn = (provider) => {
    setSocialNote(`${provider} authentication is coming soon. Please sign in with your email.`);
    setTimeout(() => setSocialNote(''), 4500);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
        portal: activePortal,
        rememberMe: Boolean(rememberMe)
      });

      const token = response?.accessToken || response?.token || authApi.getAuthToken();
      if (response && (token || authApi.isAuthenticated())) {
        const user = response.user || authApi.getCurrentUser() || {};
        const userRole = user.role || response.role;

        // Verify role-portal access
        if (activePortal === 'customer' && userRole && userRole !== 'customer') {
          throw new Error('This account does not have Customer Portal access. Please use Admin or Partner Login.');
        }

        if (activePortal === 'admin' && userRole && !['admin', 'manager', 'support'].includes(userRole)) {
          throw new Error('This account does not have Admin Portal access. Please use the Customer Login.');
        }

        if (activePortal === 'partner' && userRole && userRole !== 'partner') {
          throw new Error('This account does not have Partner Portal access.');
        }

        // Persist or clear Remember Me preferences for Customer Portal
        if (activePortal === 'customer') {
          try {
            if (rememberMe) {
              localStorage.setItem(REMEMBER_KEY, 'true');
              localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
            } else {
              localStorage.removeItem(REMEMBER_KEY);
              localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
          } catch (e) {
            // ignore localStorage quota/privacy errors
          }
        }

        // Navigate immediately to appropriate overview
        if (activePortal === 'customer' || userRole === 'customer') {
          navigate('/customer/overview', { replace: true });
        } else if (activePortal === 'partner' || userRole === 'partner') {
          navigate('/partner-dashboard', { replace: true });
        } else {
          navigate('/admin/overview', { replace: true });
        }
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Login failed. Please check your credentials.';

      if (err.activeSession || err.statusCode === 409) {
        setActiveSession({
          token: err.token,
          user: err.user,
          device: err.device || 'Active Device'
        });
      } else {
        setErrorMessage(msg);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Terminate Active Session
  const handleTerminateOtherSession = async () => {
    if (!activeSession) return;
    try {
      setIsLoading(true);
      await authApi.terminateOtherSession(activeSession.token);
      setActiveSession(null);
      if (activePortal === 'customer') {
        navigate('/customer/overview', { replace: true });
      } else if (activePortal === 'partner') {
        navigate('/partner-dashboard', { replace: true });
      } else {
        navigate('/admin/overview', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not terminate other session.');
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Password Reset
  const handleSendReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    try {
      setIsSendingReset(true);
      setResetError('');
      const res = await authApi.forgotPassword(resetEmail.trim());
      setResetSent(true);
      if (res && res.resetUrl) {
        setDevResetUrl(res.resetUrl);
      }
    } catch (err) {
      setResetError(err.message || 'Failed to send reset link.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Determine if we should display the Customer-specific 2-column video interface
  const isCustomerPortal = (
    activePortal === 'customer' ||
    location.pathname === '/customer-login' ||
    location.pathname === '/customer_login' ||
    location.pathname === '/customer/login'
  );

  return (
    <div className="ebolt-login-viewport">
      {/* Ethereal Sky Concentric Rings Background Decoration */}
      <div className="ebolt-sky-rings" aria-hidden="true">
        <div className="ebolt-ring ring-1" />
        <div className="ebolt-ring ring-2" />
        <div className="ebolt-ring ring-3" />
      </div>

      {/* Top Bar: Brand Logo & Back to Home Pill */}
      

      {/* Main Container */}
      <main className="ebolt-login-wrapper">

        {/* ====================================================================
            CONDITION 1: CUSTOMER PORTAL ONLY -> SPLIT 2-COLUMN VIDEO INTERFACE
           ==================================================================== */}
        {isCustomerPortal ? (
          <div className="ebolt-customer-split-card animate-fade-in">

            {/* LEFT COLUMN: Customer Login Section */}
            <div className="ebolt-login-col">
              <div className="ebolt-login-col-inner">

                {/* Header Group: Aligns with Top of Right Showcase Frame */}
                <div className="ebolt-login-header-group">
                  {/* Heading & Subtitle */}
                  <h1 className="ebolt-split-title">Login to Your Account</h1>
                  <p className="ebolt-split-subtitle">
                    Access your cloud instances, remote Tally licenses & support.
                  </p>

                  {/* Portal Pill Badge: Placed in the Middle & Centered */}
                  <div className="ebolt-portal-badge-wrap is-centered">
                    <span className="ebolt-portal-pill-badge">
                      <Cloud size={13} />
                      <span>Customer Portal</span>
                    </span>

                    {!isPortalLocked && (
                      <button
                        type="button"
                        className="ebolt-switch-portal-link"
                        onClick={() => handleSelectPortal('admin')}
                      >
                        Admin Login &rarr;
                      </button>
                    )}
                  </div>

                  {/* Error Notice */}
                  {errorMessage && (
                    <div className="ebolt-alert-error is-stacked" role="alert">
                      <div className="ebolt-alert-error-row">
                        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{errorMessage}</span>
                      </div>
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
                </div>

                {/* Customer Login Form: Spans Full Height of Showcase Frame */}
                <form onSubmit={handleSubmit} className="ebolt-form" noValidate>

                  {/* Inputs & Options Group */}
                  <div className="ebolt-login-fields-group">
                    {/* Email / Username */}
                    <div className="ebolt-input-wrap">
                      <Mail size={16} className="ebolt-input-icon" />
                      <input
                        type="email"
                        className="ebolt-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>

                    {/* Password with Eye Toggle */}
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

                    {/* Remember Me & Forgot Password Row */}
                    <div className="ebolt-options-row">
                      <label className="ebolt-checkbox-label">
                        <input
                          type="checkbox"
                          className="ebolt-checkbox-input"
                          checked={rememberMe}
                          onChange={(e) => handleRememberMeToggle(e.target.checked)}
                        />
                        <span>Remember Me</span>
                      </label>

                      <button
                        type="button"
                        className="ebolt-forgot-btn"
                        onClick={() => {
                          setIsForgotOpen(true);
                          setResetEmail(email);
                          setResetError('');
                          setResetSent(false);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {/* Vibrant High-Energy Gradient CTA */}
                  <button
                    type="submit"
                    className="ebolt-gradient-cta"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="ebolt-spinner" />
                    ) : (
                      <>
                        <span>Login to Your Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {socialNote && (
                    <p className="ebolt-social-note" role="status">{socialNote}</p>
                  )}

                  {/* Registration Link: Aligns with Bottom of Right Showcase Frame */}
                  <div className="ebolt-create-account-box animate-fade-in">
                    <span className="ebolt-create-account-text">Not a member yet? </span>
                    <Link to="/customer-register" className="ebolt-create-account-link">
                      Register Now
                    </Link>
                  </div>
                </form>

              </div>
            </div>

            {/* RIGHT COLUMN: Video Showcase with Ambient Highlighting */}
            <div className="ebolt-showcase-col">
              <div className="ebolt-showcase-container">
                {/* Ambient Multi-spectrum Glowing Auras */}
                <div className="ebolt-ambient-glow glow-warm" />
                <div className="ebolt-ambient-glow glow-cyan" />
                <div className="ebolt-ambient-glow glow-purple" />

                {/* Showcase Device Frame */}
                <div className="ebolt-showcase-frame">
                  {/* Chrome Top Bar */}
                  <div className="ebolt-frame-header">
                    <div className="ebolt-window-dots">
                      <span className="wdot dot-close" />
                      <span className="wdot dot-min" />
                      <span className="wdot dot-max" />
                    </div>
                    <div className="ebolt-frame-address-bar">
                      <span className="address-text">Demo Preview</span>
                    </div>
                  </div>

                  {/* Video Player Display */}
                  <div className="ebolt-video-screen">
                    <video
                      ref={videoRef}
                      src={onboardingVideo}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="ebolt-video-element"
                    />
                    <div className="ebolt-video-overlay-gradient" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ====================================================================
              CONDITION 2: ADMIN & PARTNER PORTALS -> ORIGINAL CLEAN SINGLE CARD
             ==================================================================== */
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
              {activePortal === 'partner'
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
              </div>
            )}

            {/* Form: Portal Selector Dropdown, Email, and Password */}
            <form onSubmit={handleSubmit} className="ebolt-form" noValidate>

              {/* Dropdown Selector */}
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
                  title={isPortalLocked ? `${activePortal === 'admin' ? 'Admin' : 'Partner'} Login is locked based on navbar selection` : 'Select Login Portal'}
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
                    setResetEmail(email);
                    setResetError('');
                    setResetSent(false);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
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

              {/* Create Admin Option */}
              {activePortal === 'admin' && adminConfigLoaded && !adminExists && (
                <div className="ebolt-create-account-box animate-fade-in">
                  <span className="ebolt-create-account-text">Are you a new administrator? </span>
                  <Link to="/admin/create" className="ebolt-create-account-link">
                    Create Admin
                  </Link>
                </div>
              )}
            </form>

          </div>
        )}

      </main>

      {/* Active Session Notice Modal */}
      {activeSession && (
        <div className="ebolt-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ebolt-dialog-card animate-fade-in">
            <div className="ebolt-dialog-header">
              <div className="ebolt-dialog-header-text">
                <AlertCircle size={18} color="#e11d48" />
                <h3 className="ebolt-dialog-title">Active Session Detected</h3>
              </div>
              <button
                className="ebolt-dialog-close"
                onClick={() => setActiveSession(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Your account is currently active on another device. Signing in here will safely sign out that session.
              </p>

              <div className="ebolt-dialog-footer">
                <button
                  type="button"
                  className="ebolt-btn-outline"
                  onClick={() => setActiveSession(null)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ebolt-btn-solid"
                  onClick={handleTerminateOtherSession}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Continue Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="ebolt-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ebolt-dialog-card animate-fade-in">
            <div className="ebolt-dialog-header">
              <div className="ebolt-dialog-header-text">
                <Mail size={18} color="#0284c7" />
                <h3 className="ebolt-dialog-title">Reset Password</h3>
              </div>
              <button
                className="ebolt-dialog-close"
                onClick={() => {
                  setIsForgotOpen(false);
                  setResetError('');
                  setResetSent(false);
                  setDevResetUrl('');
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body">
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Reset Link Dispatched
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    We have sent a secure password reset link to <strong>{resetEmail}</strong>.
                  </p>

                  {devResetUrl && (
                    <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.78rem', color: '#166534', textAlign: 'left' }}>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Development Notice:</span>
                      <div>
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
                    className="ebolt-btn-solid"
                    style={{ width: '100%', marginTop: '16px' }}
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

/* Inline SVG Social Icons */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
