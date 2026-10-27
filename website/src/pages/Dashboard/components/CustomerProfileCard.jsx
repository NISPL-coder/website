import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Key, 
  Calendar,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function CustomerProfileCard({ customer }) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (customer?.customerId) {
      navigator.clipboard.writeText(customer.customerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (!customer) return null;

  return (
    <div className="cust-profile-hero-card">
      <div className="cust-profile-hero-glow" aria-hidden="true" />

      <div className="cust-profile-hero-main">
        {/* Left: Avatar & Identity */}
        <div className="cust-profile-hero-left">
          <div className="cust-hero-avatar-box">
            <span>{customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}</span>
          </div>

          <div className="cust-hero-titles">
            <div className="cust-hero-badge-row">
              <span className="cust-tag-status">
                <span className="cust-pulsing-dot" />
                Active Account
              </span>
            </div>

            <h2 className="cust-hero-company-name">
              {customer.companyName}
            </h2>
            <div className="cust-hero-person-name">
              Authorized Contact: <strong>{customer.name}</strong>
            </div>
          </div>
        </div>

        {/* Right: Customer ID with One-Click Copy */}
        <div className="cust-profile-hero-right">
          <div className="cust-id-copy-box">
            <div className="cust-id-copy-label">
              <Key size={13} color="#0284c7" />
              <span>Customer ID</span>
            </div>
            <div className="cust-id-copy-val-wrap">
              <span className="cust-id-copy-val">{customer.customerId}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="cust-id-copy-btn"
                title="Copy Customer ID"
              >
                {copiedId ? (
                  <>
                    <Check size={14} color="#10b981" />
                    <span style={{ color: '#10b981' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of registered customer details */}
      <div className="cust-profile-meta-grid">
        {/* Email */}
        <div className="cust-meta-item">
          <div className="cust-meta-icon-box">
            <Mail size={16} />
          </div>
          <div className="cust-meta-content">
            <span className="cust-meta-label">Email Address</span>
            <span className="cust-meta-val" title={customer.email}>
              {customer.email}
            </span>
          </div>
        </div>

        {/* Mobile */}
        <div className="cust-meta-item">
          <div className="cust-meta-icon-box">
            <Phone size={16} />
          </div>
          <div className="cust-meta-content">
            <span className="cust-meta-label">Mobile Number</span>
            <span className="cust-meta-val">
              {customer.mobile}
            </span>
          </div>
        </div>

        {/* GST No */}
        <div className="cust-meta-item">
          <div className="cust-meta-icon-box">
            <FileText size={16} />
          </div>
          <div className="cust-meta-content">
            <span className="cust-meta-label">GST Number (GSTIN)</span>
            <span className="cust-meta-val font-mono">
              {customer.gstNo}
            </span>
          </div>
        </div>

        {/* Registration Date */}
        <div className="cust-meta-item">
          <div className="cust-meta-icon-box">
            <Calendar size={16} />
          </div>
          <div className="cust-meta-content">
            <span className="cust-meta-label">Account Onboarded</span>
            <span className="cust-meta-val">
              {customer.createdFormattedDate || 'Today'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
