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
  AlertCircle
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

          {/* 5. GST No (Full Width) */}
          <InputField
            id="reg-gst"
            label="GST No"
            placeholder="15-digit GSTIN (e.g. 19AAAAA0000A1Z5)"
            value={formData.gstNo}
            onChange={(e) => onChange('gstNo', e.target.value.toUpperCase())}
            icon={FileText}
            error={errors.gstNo}
            maxLength={15}
            wrapperClassName="ebolt-col-span-2"
          />

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

        {/* Security Trust Indicator */}
        <div className="cust-trust-footer" style={{ marginTop: '18px' }}>
          <ShieldCheck size={15} color="#059669" />
          <span>Authorized Tally 5-Star Partner • 256-Bit SSL Encrypted</span>
        </div>

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
