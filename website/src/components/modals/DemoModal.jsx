import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Building, Phone, Mail, User } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, onSubmitSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    businessType: 'Trading & Distribution',
    moduleInterest: 'Accounting + GST + Inventory',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(`Demo booked for ${formData.company || 'your business'}! Our solutions architect will call within 2 hours.`);
      onClose();
      setSubmitted(false);
    }, 1200);
  };

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '580px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #1239A6, #C026D3)' }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Book a Live 1-on-1 Demo</h2>
              <span className="modal-sub-title">Net Infotech System • Personalized Product Walkthrough</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '50px 30px', textAlign: 'center' }}>
            <CheckCircle2 size={56} color="#10B981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Demo Scheduled!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Thank you! Our senior ERP specialist will connect with you on <b>{formData.phone || '+91 98765 43210'}</b>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body-scrollable">
              <div className="form-group">
                <label>Your Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Enterprises"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business Email ID</label>
                <input
                  type="email"
                  placeholder="rajesh@sharmaenterprises.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Business Vertical</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="form-select"
                  >
                    <option value="Trading & Distribution">Trading & Distribution</option>
                    <option value="Manufacturing">Manufacturing & Assembly</option>
                    <option value="Retail & POS">Retail & Showrooms</option>
                    <option value="IT & Professional Services">IT & Professional Services</option>
                    <option value="Transport & Logistics">Transport & Logistics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Primary Focus</label>
                  <select
                    value={formData.moduleInterest}
                    onChange={(e) => setFormData({ ...formData, moduleInterest: e.target.value })}
                    className="form-select"
                  >
                    <option value="Accounting + GST + Inventory">Full ERP (Accounts + GST + Stock)</option>
                    <option value="GST e-Invoicing & e-Way">GST e-Invoicing & 2B ITC</option>
                    <option value="Warehouse & Multi-location">Multi-Warehouse Inventory</option>
                    <option value="Tally Migration">Tally Cloud Data Migration</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer-bar">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary-action">
                <Sparkles size={16} />
                <span>Confirm Free Demo</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
