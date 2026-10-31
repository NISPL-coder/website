import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';
import { authApi } from '../../../services/authApi';
import { 
  User, 
  Briefcase, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import '../LoginPage.css';
import './CreateAdminPage.css';

export default function CreateAdminPage() {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors & Loading
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Modal State: 'closed' | 'ask_admin' | 'otp_verify' | 'success'
  const [modalStep, setModalStep] = useState('closed');
  
  // Admin email from backend/.env
  const [adminEmail, setAdminEmail] = useState('nispldeveloper@gmail.com');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Fetch configured admin email on mount
  useEffect(() => {
    let isMounted = true;
    authApi.getAdminConfig()
      .then(res => {
        if (isMounted && res.adminEmail) {
          setAdminEmail(res.adminEmail);
        }
      })
      .catch(() => {
        if (isMounted) setAdminEmail('nispldeveloper@gmail.com');
      });
    return () => { isMounted = false; };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Form validation before opening modal
  const validateForm = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is mandatory.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!password) {
      errs.password = 'Password is mandatory.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is mandatory.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;
    setModalStep('ask_admin');
  };

  const handleAdminConfirmYes = () => {
    setModalStep('otp_verify');
    setVerificationError('');
    setOtpSentMessage('');
  };

  const handleAdminConfirmNo = () => {
    setModalStep('closed');
    setGeneralError('Registration cancelled. Only verified NISPL Administrators can create this account.');
  };

  const handleSendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setVerificationError('');
    setOtpSentMessage('');
    setDevOtpHint('');

    try {
      const response = await authApi.sendAdminOtp();
      setIsSendingOtp(false);
      setOtpSentMessage(response.message || `Verification OTP sent to ${adminEmail}`);
      setResendTimer(60);
      if (response.devOtp) {
        setDevOtpHint(response.devOtp);
      }
    } catch (err) {
      setIsSendingOtp(false);
      setVerificationError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();
    setVerificationError('');

    if (!otp.trim()) {
      setVerificationError('Please enter the 6-digit OTP code.');
      return;
    }

    if (otp.trim().length !== 6) {
      setVerificationError('OTP code must be exactly 6 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyAndCreateAdmin({
        name: name.trim(),
        designation: designation.trim() || undefined,
        password,
        otp: otp.trim()
      });
      setIsVerifying(false);
      setModalStep('success');
    } catch (err) {
      setIsVerifying(false);
      setVerificationError(err.message || 'Verification failed. Please check the OTP.');
    }
  };

  return (
    <div className="ebolt-login-viewport">
      {/* Top Header with Brand Logo & Back to Login */}
      <header className="ebolt-top-nav">
        <Link to="/" className="ebolt-brand-link" aria-label="NISPL Home">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="ebolt-brand-logo-img" 
          />
        </Link>

        <Link to="/login?portal=admin" className="ebolt-home-pill-btn">
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Centered Frosted Glass Card */}
      <main className="ebolt-login-wrapper">
        <div className="ebolt-login-card animate-fade-in" style={{ maxWidth: '440px' }}>
          
          {/* Top Floating Badge Icon */}
          <div className="ebolt-badge-icon-box" aria-hidden="true">
            <ShieldCheck size={24} color="#0284c7" />
          </div>

          <h1 className="ebolt-card-title">Create Admin</h1>
          <p className="ebolt-card-subtitle">
            Register a designated administrative account for NISPL Cloud Systems
          </p>

          {generalError && (
            <div className="ebolt-alert-error" role="alert">
              <AlertCircle size={15} />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleNextClick} className="ebolt-form" noValidate>
            
            {/* Full Name (Mandatory) */}
            <div>
              <div className="ebolt-input-wrap">
                <div className="ebolt-input-icon">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className={`ebolt-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  required
                />
              </div>
              {errors.name && <span className="admin-field-err">{errors.name}</span>}
            </div>

            {/* Designation (Optional) */}
            <div>
              <div className="ebolt-input-wrap">
                <div className="ebolt-input-icon">
                  <Briefcase size={16} />
                </div>
                <input
                  type="text"
                  className="ebolt-input"
                  placeholder="Designation (Optional, e.g. Cloud Architect)"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            {/* Password (Mandatory) */}
            <div>
              <div className="ebolt-input-wrap">
                <div className="ebolt-input-icon">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`ebolt-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Password (min 6 characters) *"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
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
              {errors.password && <span className="admin-field-err">{errors.password}</span>}
            </div>

            {/* Confirm Password (Mandatory) */}
            <div>
              <div className="ebolt-input-wrap">
                <div className="ebolt-input-icon">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`ebolt-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm Password *"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="ebolt-eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="admin-field-err">{errors.confirmPassword}</span>}
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="ebolt-submit-btn"
              style={{ marginTop: '8px' }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>

            {/* Back to Login Link */}
            <div className="ebolt-create-account-box">
              <span className="ebolt-create-account-text">Already an admin? </span>
              <Link to="/login?portal=admin" className="ebolt-create-account-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* =====================================================================
          STEP 1: MODAL - "Are you an Admin?"
          ===================================================================== */}
      {modalStep === 'ask_admin' && (
        <div className="ebolt-modal-backdrop" onClick={() => setModalStep('closed')}>
          <div className="ebolt-dialog-card animate-fade-in admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ebolt-dialog-header">
              <div className="admin-modal-badge">
                <HelpCircle size={22} className="text-blue" />
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => setModalStep('closed')}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body" style={{ textAlign: 'center', padding: '24px 24px' }}>
              <h3 className="admin-modal-title">Are you an Admin?</h3>
              <p className="admin-modal-desc">
                Administrative accounts require authorized ownership of the designated NISPL email address.
              </p>

              <div className="admin-confirm-actions">
                <button
                  type="button"
                  className="admin-choice-btn admin-choice-no"
                  onClick={handleAdminConfirmNo}
                >
                  No, Cancel
                </button>
                <button
                  type="button"
                  className="admin-choice-btn admin-choice-yes"
                  onClick={handleAdminConfirmYes}
                >
                  <ShieldCheck size={18} />
                  <span>Yes, I am an Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: MODAL - Email & OTP Verification
          ===================================================================== */}
      {modalStep === 'otp_verify' && (
        <div className="ebolt-modal-backdrop" onClick={() => setModalStep('closed')}>
          <div className="ebolt-dialog-card animate-fade-in admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ebolt-dialog-header">
              <div>
                <h3 className="ebolt-dialog-title" style={{ textAlign: 'left', marginBottom: '2px' }}>Admin Verification</h3>
                <span className="ebolt-dialog-sub">Verify OTP sent to designated admin email</span>
              </div>
              <button 
                type="button" 
                className="ebolt-dialog-close" 
                onClick={() => setModalStep('closed')}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ebolt-dialog-body" style={{ padding: '20px 24px' }}>
              {verificationError && (
                <div className="ebolt-alert-error" style={{ marginBottom: '14px' }}>
                  <AlertCircle size={15} />
                  <span>{verificationError}</span>
                </div>
              )}

              {otpSentMessage && (
                <div className="admin-success-banner animate-fade-in">
                  <CheckCircle2 size={16} />
                  <span>{otpSentMessage}</span>
                </div>
              )}

              {devOtpHint && (
                <div className="admin-dev-otp-box animate-fade-in">
                  <Sparkles size={14} />
                  <span>Dev OTP Code: <b>{devOtpHint}</b></span>
                </div>
              )}

              <form onSubmit={handleVerifyAndCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Admin Email Input with Send OTP button beside it */}
                <div>
                  <label className="admin-input-label">Admin Email (.env)</label>
                  <div className="admin-email-row">
                    <div className="ebolt-input-wrap admin-email-wrap">
                      <div className="ebolt-input-icon">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        className="ebolt-input admin-email-input"
                        value={adminEmail}
                        readOnly
                        title="Admin email configured in system environment"
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-send-otp-btn"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || resendTimer > 0}
                    >
                      {isSendingOtp ? (
                        <RefreshCw size={14} className="spin-icon" />
                      ) : resendTimer > 0 ? (
                        `Resend (${resendTimer}s)`
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                <div>
                  <label className="admin-input-label">Enter 6-Digit OTP</label>
                  <div className="ebolt-input-wrap">
                    <div className="ebolt-input-icon">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      className="ebolt-input admin-otp-input"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="ebolt-dialog-footer" style={{ padding: '16px 0 0 0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="ebolt-btn-outline"
                    onClick={() => setModalStep('ask_admin')}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="ebolt-btn-solid"
                    disabled={isVerifying || otp.trim().length !== 6}
                  >
                    {isVerifying ? (
                      <span className="ebolt-spinner" />
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Verify & Create</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: MODAL - Success Notification
          ===================================================================== */}
      {modalStep === 'success' && (
        <div className="ebolt-modal-backdrop">
          <div className="ebolt-dialog-card animate-fade-in admin-modal-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div className="admin-success-icon-wrap">
              <CheckCircle2 size={42} color="#16a34a" />
            </div>
            
            <h3 className="admin-modal-title" style={{ marginTop: '16px' }}>Admin Account Created!</h3>
            <p className="admin-modal-desc" style={{ marginBottom: '24px' }}>
              Your administrator account with email <b>{adminEmail}</b> is now active. You can log in directly into the Admin Portal.
            </p>

            <button
              type="button"
              className="ebolt-submit-btn"
              onClick={() => navigate('/login?portal=admin')}
            >
              <span>Proceed to Login</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
