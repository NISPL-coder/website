import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';

export default function RetypePasswordField({
  id = 'reg-retype-password',
  label = 'Retype password',
  value,
  originalPassword,
  onChange,
  error,
  required = true,
  placeholder = 'Retype password to confirm'
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isMatched = value && originalPassword && value === originalPassword;
  const isMismatch = value && originalPassword && value !== originalPassword;

  return (
    <div className="ebolt-field-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="ebolt-field-lbl" htmlFor={id}>
          <span>{label}</span>
          {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
        </label>
        {isMatched && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Check size={12} />
            Matches
          </span>
        )}
        {isMismatch && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <X size={12} />
            Mismatch
          </span>
        )}
      </div>

      <div className={`ebolt-input-wrap ${error || isMismatch ? 'has-error' : isMatched ? 'has-success' : ''}`}>
        <Lock size={16} className="ebolt-input-icon" />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className="ebolt-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="ebolt-eye-btn"
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error ? (
        <span className="ebolt-field-error-msg" role="alert">
          {error}
        </span>
      ) : (
        <span className="ebolt-field-hint">
          Re-enter your exact password
        </span>
      )}
    </div>
  );
}
