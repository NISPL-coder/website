import React, { useState } from 'react';
import Select from 'react-select';
import { customSelectStyles } from '../../pages/login/Admin/reactSelectStyles';
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
    moduleInterest: 'Enterprise Cloud Infrastructure',
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
                    <Briefcase size={15} className="demo-input-icon" style={{ zIndex: 2, pointerEvents: 'none' }} />
                    <Select
                      classNamePrefix="react-select"
                      isSearchable={false}
                      styles={{
                        ...customSelectStyles,
                        valueContainer: (base) => ({
                          ...customSelectStyles.valueContainer(base),
                          paddingLeft: '36px'
                        })
                      }}
                      options={[
                        { value: 'IT & Software Enterprises', label: 'IT & Software' },
                        { value: 'Banking & Financial Services (BFSI)', label: 'Banking & Financial (BFSI)' },
                        { value: 'Manufacturing & Industrial', label: 'Manufacturing' },
                        { value: 'Trading, Distribution & Retail', label: 'Trading & Retail' },
                        { value: 'Healthcare & Life Sciences', label: 'Healthcare' },
                        { value: 'Government & Public Sector', label: 'Government & PSU' }
                      ]}
                      value={
                        [
                          { value: 'IT & Software Enterprises', label: 'IT & Software' },
                          { value: 'Banking & Financial Services (BFSI)', label: 'Banking & Financial (BFSI)' },
                          { value: 'Manufacturing & Industrial', label: 'Manufacturing' },
                          { value: 'Trading, Distribution & Retail', label: 'Trading & Retail' },
                          { value: 'Healthcare & Life Sciences', label: 'Healthcare' },
                          { value: 'Government & Public Sector', label: 'Government & PSU' }
                        ].find((o) => o.value === formData.businessType) || null
                      }
                      onChange={(opt) =>
                        setFormData({ ...formData, businessType: opt ? opt.value : 'IT & Software Enterprises' })
                      }
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      menuPosition="fixed"
                    />
                  </div>
                </div>

                <div className="demo-form-group">
                  <label className="demo-form-label">
                    Primary Solution Focus
                  </label>
                  <div className="demo-input-wrapper">
                    <Server size={15} className="demo-input-icon" style={{ zIndex: 2, pointerEvents: 'none' }} />
                    <Select
                      classNamePrefix="react-select"
                      isSearchable={false}
                      styles={{
                        ...customSelectStyles,
                        valueContainer: (base) => ({
                          ...customSelectStyles.valueContainer(base),
                          paddingLeft: '36px'
                        })
                      }}
                      options={[
                        { value: 'Enterprise Cloud Infrastructure', label: 'Enterprise Cloud Infrastructure' },
                        { value: 'Cloud Server & Hosting', label: 'Cloud Server & Hosting' },
                        { value: 'Enterprise ERP & Tally on Cloud', label: 'Enterprise ERP / Tally Cloud' },
                        { value: 'Cybersecurity & Zero-Trust', label: 'Cybersecurity & Zero-Trust' },
                        { value: 'Disaster Recovery & BCP', label: 'Disaster Recovery (DR/BCP)' },
                        { value: 'IT Infrastructure Audit', label: 'IT Infrastructure Audit' }
                      ]}
                      value={
                        [
                          { value: 'Enterprise Cloud Infrastructure', label: 'Enterprise Cloud Infrastructure' },
                          { value: 'Cloud Server & Hosting', label: 'Cloud Server & Hosting' },
                          { value: 'Enterprise ERP & Tally on Cloud', label: 'Enterprise ERP / Tally Cloud' },
                          { value: 'Cybersecurity & Zero-Trust', label: 'Cybersecurity & Zero-Trust' },
                          { value: 'Disaster Recovery & BCP', label: 'Disaster Recovery (DR/BCP)' },
                          { value: 'IT Infrastructure Audit', label: 'IT Infrastructure Audit' }
                        ].find((o) => o.value === formData.moduleInterest) || null
                      }
                      onChange={(opt) =>
                        setFormData({
                          ...formData,
                          moduleInterest: opt ? opt.value : 'Enterprise Cloud Infrastructure'
                        })
                      }
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      menuPosition="fixed"
                    />
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
