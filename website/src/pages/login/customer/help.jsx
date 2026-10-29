import React, { useState } from 'react';
import {
  Headphones,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  Send,
  X,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

import supportAgentImg from '../../../assets/support_agent.jpg';
import officeMapImg from '../../../assets/office_map.jpg';
import './HelpSection.css';

const FAQS = [
  {
    q: 'How can I contact your support team?',
    a: 'You can reach our dedicated technical support team 24/7 via phone (+91 9147213102), email (support@netinfotechsystem.com), WhatsApp priority desk, or by raising a support request ticket directly from this portal.'
  },
  {
    q: 'What are your working hours?',
    a: 'Our enterprise NOC and server monitoring watch operates 24/7/365. Direct telephone desk specialists and licensing consultants are available Monday to Saturday, 9:30 AM to 7:00 PM.'
  },
  {
    q: 'How do I get technical support for Tally or other software?',
    a: 'Our certified Tally Prime engineers provide 1-click remote desktop assistance (via AnyDesk / TeamViewer), database migration support, TDL customization troubleshooting, and corporate accounting synchronization.'
  },
  {
    q: 'Do you provide remote support?',
    a: 'Yes, we provide instant live screen-share remote support using AnyDesk and TeamViewer. You can share your session ID with our engineers over WhatsApp or phone for immediate diagnosis.'
  },
  {
    q: 'How can I track my order or service request?',
    a: 'All service requests, licenses, and subscriptions are tracked in real-time under your Customer Dashboard. You can also view all active invoices, GST receipts, and renewal dates.'
  }
];

export default function HelpSection({ customer }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(null);

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.mobile || customer?.phone || '',
    serviceCategory: 'Tally Prime Support & Licensing',
    subject: '',
    description: ''
  });

  const handleToggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.description.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `NIS-SR-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsSubmitting(false);
      setTicketSubmitted(ticketId);
      toast.success(`Support request #${ticketId} created! Our engineer will reach out.`);
    }, 700);
  };

  const handleResetModal = () => {
    setFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.mobile || customer?.phone || '',
      serviceCategory: 'Tally Prime Support & Licensing',
      subject: '',
      description: ''
    });
    setTicketSubmitted(null);
    setIsModalOpen(false);
  };

  return (
    <div className="help-desk-ui-container animate-fade-in">

      {/* ═══════════════════════════════════════════════════════════
          ROW 2: Frequently Asked Questions (Left) + Quick Support (Right)
          ═══════════════════════════════════════════════════════════ */}
      <div className="help-desk-bottom-row">
        {/* Left: Frequently Asked Questions */}
        <div className="help-desk-faq-card">
          <div className="faq-card-header">
            <div className="faq-icon-title-row">
              <MessageSquare size={22} className="faq-title-icon" />
              <h3 className="faq-card-title">Frequently Asked Questions</h3>
            </div>
            <p className="faq-card-subtitle">
              Find quick answers to the most common questions. Can't find what you need? Contact our support team.
            </p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => handleToggleFaq(index)}
                >
                  <div className="faq-item-question-row">
                    <span className="faq-item-question-text">{faq.q}</span>
                    <ChevronDown size={18} className="faq-chevron-icon" />
                  </div>
                  {isOpen && (
                    <div className="faq-item-answer-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Support Card */}
        <div className="help-desk-quick-support-card">
          <div className="quick-support-header">
            <div className="quick-support-icon-title-row">
              <Headphones size={22} className="quick-support-header-icon" />
              <h3 className="quick-support-title">Quick Support</h3>
            </div>
            <p className="quick-support-subtitle">
              Get in touch with us anytime, we are available 24/7.
            </p>
          </div>

          <div className="quick-support-channels">
            {/* Channel 1: Call Us */}
            <div className="quick-channel-item">
              <div className="channel-circle-icon">
                <Phone size={18} />
              </div>
              <div className="channel-content">
                <span className="channel-label">Call Us</span>
                <a href="tel:+919147213102" className="channel-main-val">
                  +91 9147213102
                </a>
              </div>
              <span className="channel-badge-green">24/7 Support</span>
            </div>

            {/* Channel 2: Email Us */}
            <div className="quick-channel-item">
              <div className="channel-circle-icon">
                <Mail size={18} />
              </div>
              <div className="channel-content">
                <span className="channel-label">Email Us</span>
                <a href="mailto:support@netinfotechsystem.com" className="channel-main-val">
                  support@netinfotechsystem.com
                </a>
                <span className="channel-sub-note">We reply within 1 hour</span>
              </div>
            </div>

            {/* Channel 3: Live Chat */}
            <div className="quick-channel-item">
              <div className="channel-circle-icon">
                <MessageSquare size={18} />
              </div>
              <div className="channel-content">
                <span className="channel-label">Whatsapp Chat</span>
                <a
                  href="https://wa.me/919147213102?text=Hi%20NISPL%20Support,%20I%20have%20a%20query"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-chat-link"
                >
                  Chat with our support team
                </a>
                <span className="channel-live-dot-label">
                  <span className="live-dot" /> Available 24/7
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Support Request Modal (When user clicks CTA)
          ═══════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="help-modal-overlay" onClick={handleResetModal}>
          <div className="help-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <div>
                <h3 className="help-modal-title">Open a Support Request</h3>
                <p className="help-modal-sub">
                  Fill in your details and our technical lead will assist you.
                </p>
              </div>
              <button
                type="button"
                className="help-modal-close"
                onClick={handleResetModal}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="help-modal-success">
                <CheckCircle2 size={48} className="modal-success-icon" />
                <h4>Support Request Received!</h4>
                <p className="modal-ticket-id">
                  Ticket Reference: <strong>#{ticketSubmitted}</strong>
                </p>
                <p className="modal-success-text">
                  Our domain engineer has been alerted and will contact you shortly.
                </p>
                <button
                  type="button"
                  className="modal-done-btn"
                  onClick={handleResetModal}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="help-modal-form">
                <div className="modal-row-2">
                  <div className="modal-field">
                    <label>
                      Your Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Debasish Ghosh"
                      required
                    />
                  </div>
                  <div className="modal-field">
                    <label>
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+91 9147213102"
                      required
                    />
                  </div>
                </div>

                <div className="modal-row-2">
                  <div className="modal-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="name@company.com"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Service / Category</label>
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleFormChange}
                    >
                      <option value="Tally Prime Support & Licensing">Tally Prime Support & Licensing</option>
                      <option value="Tally on Cloud Hosting">Tally on Cloud Hosting</option>
                      <option value="CtrlS / Azure / AWS Cloud Server">CtrlS / Azure / AWS Cloud Server</option>
                      <option value="IT Hardware, Servers & AMC">IT Hardware, Servers & AMC</option>
                      <option value="Cybersecurity & Network Support">Cybersecurity & Network Support</option>
                      <option value="Billing & Invoicing Query">Billing & Invoicing Query</option>
                      <option value="General Query">General Query</option>
                    </select>
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Subject <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Detailed Message <span className="req">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Provide details about the issue or question..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={handleResetModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={isSubmitting}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Sending...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { HelpSection as Help, HelpSection as help };
