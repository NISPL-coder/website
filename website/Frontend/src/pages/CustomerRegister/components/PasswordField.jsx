import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { getPasswordStrength } from '../utils/validation';

export default function PasswordField({
  id = 'reg-create-password',
  label = 'Create password',
  value,
  onChange,
  error,
  required = true,
  placeholder = 'Create strong password'
}) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <div className="ebolt-field-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="ebolt-field-lbl" htmlFor={id}>
          <span>{label}</span>
          {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
        </label>
        {value && strength.label && (
          <span 
            style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: strength.color 
            }}
          >
            {strength.label}
          </span>
        )}
      </div>

      <div className={`ebolt-input-wrap ${error ? 'has-error' : ''}`}>
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

      {/* Password Strength Progress Bar */}
      {value && (
        <div className="ebolt-pwd-strength-bar-track" aria-hidden="true">
          <div
            className="ebolt-pwd-strength-bar-fill"
            style={{
              width: `${strength.percent}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      )}

      {error ? (
        <span className="ebolt-field-error-msg" role="alert">
          {error}
        </span>
      ) : (
        <span className="ebolt-field-hint">
          Must be at least 6 characters
        </span>
      )}
    </div>
  );
}
