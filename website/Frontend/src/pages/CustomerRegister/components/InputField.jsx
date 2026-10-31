import React from 'react';

export default function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = true,
  maxLength,
  error,
  autoFocus = false,
  className = '',
  wrapperClassName = ''
}) {
  return (
    <div className={`ebolt-field-group ${wrapperClassName}`}>
      <label className="ebolt-field-lbl" htmlFor={id}>
        <span>{label}</span>
        {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>

      <div className={`ebolt-input-wrap ${error ? 'has-error' : ''}`}>
        {Icon && <Icon size={16} className="ebolt-input-icon" />}
        <input
          id={id}
          type={type}
          className={`ebolt-input ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete="off"
        />
      </div>

      {error && (
        <span className="ebolt-field-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
