import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  Server, 
  CheckCircle2
} from 'lucide-react';
import './DemoModal.css';

export default function DemoModal({ isOpen, onClose, onSubmitSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    businessType: 'IT & Software Enterprises',
    moduleInterest: 'CtrlS Kolkata Datacenter',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(
          `Consultation request received for ${formData.company || formData.name}. Our enterprise team will connect with you shortly.`
        );
      }
    }, 600);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="demo-modal-overlay" onClick={handleClose}>
      <div 
        className="demo-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        {/* Modal Header */}
        <div className="demo-modal-header">
          <div className="demo-modal-heading-text">
            <h2 id="demo-modal-title" className="demo-modal-title">
              Schedule a Consultation
            </h2>
            <p className="demo-modal-subtitle">
              Connect with an enterprise solutions architect from Net Infotech System.
            </p>
          </div>
          <button 
            type="button" 
            className="demo-modal-close-btn" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        {submitted ? (
          <div className="demo-success-box">
            <div className="demo-success-icon-wrap">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="demo-success-title">Request Received</h3>
            <p className="demo-success-desc">
              Thank you, <strong style={{ color: '#FFFFFF' }}>{formData.name || 'there'}</strong>. 
              Our team will review your requirements for{' '}
              <strong style={{ color: '#38BDF8' }}>{formData.moduleInterest}</strong> and get in touch at{' '}
              <strong style={{ color: '#FFFFFF' }}>{formData.phone || '+91 98765 43210'}</strong>.
            </p>
            <button 
              type="button" 
              className="demo-success-close-btn"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="demo-modal-form">
            <div className="demo-modal-body">
              {/* Full Name */}
              <div className="demo-form-group">
                <label className="demo-form-label">
                  Full Name<span className="demo-required-star">*</span>
                </label>
                <div className="demo-input-wrapper">
                  <User size={15} className="demo-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="demo-form-input"
                  />
                </div>
              </div>

              {/* Company & Phone Row */}
              <div className="demo-form-row-2">
                <div className="demo-form-group">
                  <label className="demo-form-label">
                    Company Name<span className="demo-required-star">*</span>
                  </label>
                  <div className="demo-input-wrapper">
                    <Building2 size={15} className="demo-input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Sharma Enterprises"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="demo-form-input"
                    />
                  </div>
                </div>

                <div className="demo-form-group">
                  <label className="demo-form-label">
                    Mobile Number<span className="demo-required-star">*</span>
                  </label>
                  <div className="demo-input-wrapper">
                    <Phone size={15} className="demo-input-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="demo-form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Business Email */}
              <div className="demo-form-group">
                <label className="demo-form-label">
                  Business Email ID<span className="demo-required-star">*</span>
                </label>
                <div className="demo-input-wrapper">
                  <Mail size={15} className="demo-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="rajesh@sharmaenterprises.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="demo-form-input"
                  />
                </div>
              </div>

              {/* Vertical & Interest Row */}
              <div className="demo-form-row-2">
                <div className="demo-form-group">
                  <label className="demo-form-label">
                    Industry / Vertical
                  </label>
                  <div className="demo-input-wrapper">
                    <Briefcase size={15} className="demo-input-icon" />
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="demo-form-select"
                    >
                      <option value="IT & Software Enterprises">IT & Software</option>
                      <option value="Banking & Financial Services (BFSI)">Banking & Financial (BFSI)</option>
                      <option value="Manufacturing & Industrial">Manufacturing</option>
                      <option value="Trading, Distribution & Retail">Trading & Retail</option>
                      <option value="Healthcare & Life Sciences">Healthcare</option>
                      <option value="Government & Public Sector">Government & PSU</option>
                    </select>
                  </div>
                </div>

                <div className="demo-form-group">
                  <label className="demo-form-label">
                    Primary Solution Focus
                  </label>
                  <div className="demo-input-wrapper">
                    <Server size={15} className="demo-input-icon" />
                    <select
                      value={formData.moduleInterest}
                      onChange={(e) => setFormData({ ...formData, moduleInterest: e.target.value })}
                      className="demo-form-select"
                    >
                      <option value="CtrlS Kolkata Datacenter">CtrlS Kolkata Datacenter</option>
                      <option value="Cloud Server & Hosting">Cloud Server & Hosting</option>
                      <option value="Enterprise ERP & Tally on Cloud">Enterprise ERP / Tally Cloud</option>
                      <option value="Cybersecurity & Zero-Trust">Cybersecurity & Zero-Trust</option>
                      <option value="Disaster Recovery & BCP">Disaster Recovery (DR/BCP)</option>
                      <option value="IT Infrastructure Audit">IT Infrastructure Audit</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="demo-modal-footer">
              <button 
                type="button" 
                className="demo-modal-cancel-btn" 
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="demo-modal-submit-btn"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Submitting...' : 'Confirm Consultation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
