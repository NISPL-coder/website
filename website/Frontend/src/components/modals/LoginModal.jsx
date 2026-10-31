import React, { useState } from 'react';
import { X, LogIn, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/authApi';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email: username.trim(),
        password
      });

      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(`Welcome back, ${response.user.name}! Signed into Net Infotech System.`);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '440px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #1239A6, #2563EB)' }}>
              <LogIn size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Client ERP Portal Login</h2>
              <span className="modal-sub-title">Net Infotech System • Secure Cloud Access</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-body-scrollable">
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label>Business Email or Company User ID</label>
              <input
                type="text"
                required
                placeholder="Enter email or NIS-CUST-ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" defaultChecked /> Remember company session
              </label>
              <a 
                href="#reset" 
                onClick={async (e) => { 
                  e.preventDefault(); 
                  if (!username.trim()) {
                    alert("Please enter your registered email address first.");
                    return;
                  }
                  try {
                    await authApi.forgotPassword(username.trim());
                    alert("Password reset instructions have been dispatched to your email.");
                  } catch (err) {
                    alert(err.message);
                  }
                }} 
                style={{ color: 'var(--primary-light)', fontWeight: 600 }}
              >
                Forgot?
              </a>
            </div>
          </div>

          <div className="modal-footer-bar">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action" disabled={loading}>
              <LogIn size={16} />
              <span>{loading ? "Authenticating..." : "Sign In to ERP"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
