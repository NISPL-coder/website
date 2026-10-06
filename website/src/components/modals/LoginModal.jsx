import React, { useState } from 'react';
import { X, LogIn, Lock, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('admin@netinfotechsystem.in');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess("Welcome back, Administrator! Signed into Net Infotech System.");
      onClose();
      setLoading(false);
    }, 1000);
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
            <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.2)', fontSize: '0.8rem', color: 'var(--primary)' }}>
              <UserCheck size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Demo Access Mode: Click <b>Sign In</b> below to access the ERP workspace.
            </div>

            <div className="form-group">
              <label>Business Email or Company User ID</label>
              <input
                type="text"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" defaultChecked /> Remember company session
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Password reset token sent to your registered mobile."); }} style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Forgot?</a>
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
