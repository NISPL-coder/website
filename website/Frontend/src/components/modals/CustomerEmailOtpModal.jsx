import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, RotateCw, X, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/authApi';
import './CustomerEmailOtpModal.css';

export default function CustomerEmailOtpModal({
  isOpen,
  onClose,
  customerEmail,
  customerName = '',
  onVerified
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [hasAutoSent, setHasAutoSent] = useState(false);

  const inputRefs = useRef([]);

  // Auto-send OTP when modal opens for the first time
  useEffect(() => {
    if (isOpen && !hasAutoSent) {
      setHasAutoSent(true);
      sendOtp(true);
    }
  }, [isOpen, hasAutoSent]);

  // Focus the first input box and lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
    } else {
      // Reset state when closed
      document.body.style.overflow = '';
      setDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setSuccessMessage('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const sendOtp = async (isInitial = false) => {
    setIsSendingOtp(true);
    setErrorMessage('');
    if (!isInitial) {
      setSuccessMessage('');
    }

    try {
      const res = await authApi.sendCustomerVerificationOtp();
      if (res && res.alreadyVerified) {
        toast.success('Your primary email is already verified!');
        if (onVerified) onVerified(res);
        if (onClose) onClose();
        return;
      }

      if (res && res.devOtp) {
        setDevOtpHint(res.devOtp);
      }

      setResendTimer(60);
      toast.success(res.message || `Verification code sent to ${customerEmail || 'your email'}`);
    } catch (err) {
      console.error('Failed to send customer OTP:', err);
      const msg = err.message || 'Failed to dispatch verification code. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Keep only the last character and only numbers
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);
    setErrorMessage('');

    // Automatically advance focus to next input
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus on next empty or the last digit
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = digits.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await authApi.verifyCustomerEmailOtp(fullOtp);
      setSuccessMessage('Primary email verified successfully!');
      toast.success('Your primary email has been successfully verified!');

      if (onVerified) {
        onVerified(res);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to verify customer email OTP:', err);
      const msg = err.message || 'Invalid or expired verification code. Please check and try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isComplete = digits.every((d) => d !== '');

  const modalContent = (
    <div className="customer-otp-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="customer-otp-backdrop" onClick={onClose} />
      <div className="customer-otp-card animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          className="customer-otp-close"
          onClick={onClose}
          aria-label="Close verification dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Top Header */}
        <div className="customer-otp-header">
          <div className="customer-otp-badge-icon">
            <ShieldCheck size={28} className="shield-icon" />
          </div>
          <h3 className="customer-otp-title">Verify Primary Email</h3>
          <p className="customer-otp-subtitle">
            To safeguard your cloud account and confirm your identity, please enter the 6-digit verification code sent to:
          </p>
          <div className="customer-otp-email-pill">
            <Mail size={14} className="mail-pill-icon" />
            <span className="mail-pill-text">{customerEmail || 'your primary email'}</span>
          </div>
        </div>

        {/* Development Helper Badge */}
        {devOtpHint && (
          <div className="customer-otp-dev-hint">
            <span className="dev-tag">DEV MODE OTP</span>
            <span className="dev-code">{devOtpHint}</span>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="customer-otp-alert error animate-shake" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="customer-otp-alert success animate-fade-in" role="status">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="customer-otp-form">
          <div className="customer-otp-boxes" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`customer-otp-digit ${digit ? 'filled' : ''} ${errorMessage ? 'has-error' : ''}`}
                disabled={isSubmitting}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="customer-otp-actions">
            <button
              type="submit"
              className="customer-otp-submit-btn"
              disabled={!isComplete || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={16} className="spin-icon" />
                  <span>Verifying Code…</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Resend Code Footer */}
          <div className="customer-otp-resend-row">
            <span>Didn't receive the email?</span>
            {resendTimer > 0 ? (
              <span className="customer-otp-resend-countdown">
                Resend in <b>{resendTimer}s</b>
              </span>
            ) : (
              <button
                type="button"
                className="customer-otp-resend-btn"
                onClick={() => sendOtp(false)}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? 'Sending…' : 'Resend Code'}
              </button>
            )}
          </div>
        </form>

        {/* Security Assurance */}
        <div className="customer-otp-footer">
          <Lock size={12} />
          <span>Protected with 256-bit TLS encryption</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

