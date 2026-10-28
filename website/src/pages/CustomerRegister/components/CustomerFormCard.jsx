import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InputField from './InputField';
import PasswordField from './PasswordField';
import RetypePasswordField from './RetypePasswordField';

export default function CustomerFormCard({
  formData,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  globalError
}) {
  return (
    <div className="cust-reg-card animate-fade-in">
      {/* Top Floating Badge Icon */}
      <div className="ebolt-badge-icon-box" aria-hidden="true">
        <UserPlus size={22} color="#0284c7" />
      </div>

      {/* Main Headings */}
      <div className="ebolt-reg-header-center">
        <h1 className="ebolt-card-title">Create Customer Account</h1>
        <p className="ebolt-card-subtitle">
          Enter your entity credentials and password to set up your customer account.
        </p>
      </div>

      {/* Section Title */}
      <div className="ebolt-section-heading" style={{ marginTop: '16px' }}>
        <span>Customer Details</span>
      </div>

      {/* Global Validation Alert */}
      {globalError && (
        <div className="ebolt-alert-error" role="alert" style={{ marginTop: '14px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="ebolt-form" style={{ marginTop: '18px' }} noValidate>
        <div className="ebolt-form-grid-2">
          {/* 1. Name */}
          <InputField
            id="reg-name"
            label="Name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            icon={User}
            error={errors.name}
            autoFocus
          />

          {/* 2. Email */}
          <InputField
            id="reg-email"
            label="Email"
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            icon={Mail}
            error={errors.email}
          />

          {/* 3. Mobile */}
          <InputField
            id="reg-mobile"
            label="Mobile"
            type="tel"
            placeholder="Enter Mobile Number"
            value={formData.mobile}
            onChange={(e) => onChange('mobile', e.target.value)}
            icon={Phone}
            error={errors.mobile}
          />

          {/* 4. Company Name */}
          <InputField
            id="reg-company"
            label="Company name"
            placeholder="Company / Enterprise Name"
            value={formData.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            icon={Building2}
            error={errors.companyName}
          />

          {/* 5. GST No */}
          <InputField
            id="reg-gst"
            label="GST No"
            placeholder="15-digit GSTIN (e.g. 19AAAAA0000A1Z5)"
            value={formData.gstNo}
            onChange={(e) => onChange('gstNo', e.target.value.toUpperCase())}
            icon={FileText}
            error={errors.gstNo}
            maxLength={15}
          />

          {/* 6. Company Logo*/}
          <div className="ebolt-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="ebolt-field-lbl" htmlFor="reg-logo" style={{ marginBottom: 0 }}>
                <span>Company logo</span>
              </label>
              {formData.companyLogo && (
                <button
                  type="button"
                  onClick={() => onChange('companyLogo', '')}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                  title="Remove logo"
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>

            <div className="ebolt-input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {formData.companyLogo ? (
                <img
                  src={formData.companyLogo}
                  alt="Logo preview"
                  style={{ width: '22px', height: '22px', objectFit: 'contain', marginLeft: '12px', borderRadius: '4px' }}
                />
              ) : (
                <ImageIcon size={16} className="ebolt-input-icon" />
              )}
              <input
                id="reg-logo"
                type="text"
                className="ebolt-input"
                placeholder="Logo URL or click Upload"
                value={formData.companyLogo}
                onChange={(e) => onChange('companyLogo', e.target.value)}
                style={{ paddingRight: '82px' }}
                autoComplete="off"
              />
              <label
                htmlFor="reg-logo-file"
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Upload image from device"
              >
                <Upload size={12} />
                <span>Upload</span>
              </label>
              <input
                id="reg-logo-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Logo file size must be less than 2MB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onChange('companyLogo', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          {/* 6. Create Password */}
          <PasswordField
            id="reg-password"
            label="Create password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            error={errors.password}
          />

          {/* 7. Retype Password */}
          <RetypePasswordField
            id="reg-retype-password"
            label="Retype password"
            value={formData.retypePassword}
            originalPassword={formData.password}
            onChange={(e) => onChange('retypePassword', e.target.value)}
            error={errors.retypePassword}
          />
        </div>

        {/* Action Button: Create Customer and Launch Dashboard */}
        <button
          type="submit"
          className="ebolt-submit-btn"
          id="btn-create-customer"
          disabled={isSubmitting}
          style={{ marginTop: '24px' }}
        >
          {isSubmitting ? (
            <>
              <span className="ebolt-spinner" />
              <span>Creating Customer & Setting Up Dashboard...</span>
            </>
          ) : (
            <>
              <span>Create Customer Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Sign In Alternative Link */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an active account?{' '}
          <Link 
            to="/customer-login" 
            style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In here
          </Link>
        </div>
      </form>
    </div>
  );
}
