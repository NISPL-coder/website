import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import { authApi } from '../../services/authApi';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing from the URL. Please use the complete link provided in your email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token.trim(), password);
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to reset password. The link may have expired or is invalid.');
    }
  };

  return (
    <div className="ebolt-login-viewport">
      {/* Top Header */}
      <header className="ebolt-top-nav">
        <Link to="/" className="ebolt-brand-link" title="Net Infotech System Pvt. Ltd.">
          <img 
            src={logoImg} 
            alt="Net Infotech System Pvt. Ltd." 
            className="ebolt-brand-logo-img" 
            height="48"
          />
        </Link>

        <Link to="/login" className="ebolt-home-pill-btn">
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Form Card */}
      <main className="ebolt-login-wrapper">
        <div className="ebolt-login-card animate-fade-in" style={{ maxWidth: '440px' }}>
          
          {/* Badge Icon */}
          <div className="ebolt-badge-icon-box" aria-hidden="true">
            <KeyRound size={22} color="#0284c7" />
          </div>

          <h1 className="ebolt-card-title">Reset Password</h1>
          <p className="ebolt-card-subtitle">
            Enter and confirm your new secure account password below
          </p>

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }} className="animate-fade-in">
              <CheckCircle2 size={46} color="#16a34a" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Password Reset Successfully!
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
                Your account password has been updated. You can now log into your account using your new credentials.
              </p>
              <button 
                type="button" 
                className="ebolt-submit-btn"
                onClick={() => navigate('/login')}
              >
                <span>Proceed to Login</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }} className="animate-fade-in">
              <div className="ebolt-alert-error" role="alert" style={{ marginBottom: '18px', textAlign: 'left' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Password reset token is missing or invalid. Please request a new recovery link from the login page.
                </span>
              </div>
              <Link 
                to="/login" 
                className="ebolt-submit-btn"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Return to Login</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="ebolt-alert-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="ebolt-form" noValidate>
                {/* New Password */}
                <div className="ebolt-input-wrap">
                  <Lock size={16} className="ebolt-input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="ebolt-input"
                    placeholder="New password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    autoFocus
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

                {/* Confirm New Password */}
                <div className="ebolt-input-wrap">
                  <Lock size={16} className="ebolt-input-icon" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="ebolt-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
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

                {/* Submit Action */}
                <button 
                  type="submit" 
                  className="ebolt-submit-btn"
                  disabled={isLoading}
                  style={{ marginTop: '8px' }}
                >
                  {isLoading ? (
                    <span className="ebolt-spinner" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="ebolt-create-account-box">
                  <span className="ebolt-create-account-text">Remembered your credentials? </span>
                  <Link to="/login" className="ebolt-create-account-link">
                    Sign In
                  </Link>
                </div>
              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

