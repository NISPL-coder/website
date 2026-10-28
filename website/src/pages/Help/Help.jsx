import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LifeBuoy,
  Phone,
  Mail,
  MapPin,
  Headphones,
  ExternalLink,
  MessageSquare,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Send,
  Monitor,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import logoImg from '../../assets/NISPL Cloud Tech Logo Black.png';
import LinkedInQRCode from '../../components/LinkedInQRCode';
import Footer from '../../components/Footer';

import photoFinancialSpecialist from '../../assets/corporate_team_handshake.webp';
import photoMicrosoftCloudEng from '../../assets/office_engineers_collaborating.webp';
import photoDatacenterArchitect from '../../assets/client_team_celebration.webp';

import './Help.css';

const ASSOCIATES = [
  {
    id: 'business',
    badge: 'Primary Inquiries',
    name: 'Business Solutions Desk',
    role: 'Enterprise Client Engagements & Software Licensing',
    email: 'business@netinfotechsystem.com',
    phone: '+91 9330113000',
    address: 'Webel Tower 1, Sector-V, Salt Lake, Kolkata - 700091',
    image: photoFinancialSpecialist,
    linkedinUrl: 'https://www.linkedin.com/company/net-infotech-system/'
  },
  {
    id: 'tally',
    badge: 'Tally Certified',
    name: 'Tally & Cloud Advisory Team',
    role: 'Tally Prime, Cloud Hosting & Corporate Migration Head',
    email: 'tally@netinfotechsystem.com',
    phone: '033 - 4001 3000',
    address: 'Webel Tower 1, Sector-V, Salt Lake, Kolkata - 700091',
    image: photoMicrosoftCloudEng,
    linkedinUrl: 'https://www.linkedin.com/company/net-infotech-system/'
  },
  {
    id: 'support',
    badge: 'Hardware & AMC',
    name: 'IT Infrastructure & AMC Support',
    role: 'Data Center, Network Infrastructure & Annual Maintenance',
    email: 'support@netinfotechsystem.com',
    phone: '+91 9330113000',
    address: 'Webel Tower 1, Sector-V, Salt Lake, Kolkata - 700091',
    image: photoDatacenterArchitect,
    linkedinUrl: 'https://www.linkedin.com/company/net-infotech-system/'
  }
];

const FAQS = [
  {
    q: 'How do I access my dedicated Tally on Cloud server?',
    a: 'You can connect instantly via standard Remote Desktop Protocol (RDP) on Windows, Mac, or mobile devices using your dedicated IP and credentials sent to your registered email. We also provide HTML5 web-browser terminal access without any local software installation.'
  },
  {
    q: 'What is the standard SLA for critical software or server issues?',
    a: 'For Critical / Severity-1 incidents (such as complete server unreachability or accounting downtime), our response SLA is under 15 minutes. Our NOC monitors all CtrlS and Azure instances 24/7/365.'
  },
  {
    q: 'How do I request emergency remote assistance for Tally errors?',
    a: 'You can launch AnyDesk or TeamViewer and share your connection code with our support engineer via WhatsApp (+91 9330113000) or through the ticket form below. A certified engineer will connect live to resolve the issue.'
  },
  {
    q: 'Where can I download tax-compliant GST receipts and invoices?',
    a: 'All invoices, GST credits, and payment receipts are permanently stored in your Customer Dashboard under the "Receipt" and "Payment" tabs. You can download official PDF copies with 1-click.'
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Tally Prime License & Installation',
    subject: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.name.trim() || !ticketForm.phone.trim() || !ticketForm.description.trim()) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `NIS-HD-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
      toast.success(`Support ticket #${ticketId} registered! Our engineer will contact you.`);
    }, 700);
  };

  const handleResetTicket = () => {
    setTicketForm({
      name: '',
      email: '',
      phone: '',
      category: 'Tally Prime License & Installation',
      subject: '',
      description: ''
    });
    setSubmittedTicket(null);
  };

  return (
    <div className="help-page-root">
      <Toaster position="top-right" />

      {/* ── Top Header Navigation Bar ────────────────────────── */}
      <header className="help-top-navbar">
        <div className="help-nav-container">
          <div className="help-nav-left">
            <Link to="/" className="help-brand-link" title="Net Infotech System Pvt. Ltd.">
              <img src={logoImg} alt="Net Infotech System Pvt. Ltd." className="help-brand-logo" />
            </Link>
            <div className="help-portal-badge">
              <LifeBuoy size={14} className="badge-icon" />
              <span>Help Desk & Support</span>
            </div>
          </div>

          <div className="help-nav-right">
            <Link
              to="/customer/overview"
              className="help-back-dashboard-btn"
              title="Return to Customer Dashboard"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>

            <a
              href="https://wa.me/919330113000?text=Hi%20NISPL%20Support,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="help-whatsapp-btn"
              title="Chat with engineer on WhatsApp"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────── */}


      {/* ── Business Associates Section (Matching ContactPage) ── */}
      <section className="iz-associates-section help-associates-wrap">
        <div className="help-container">
          <div className="iz-associates-header">

            <h2 className="iz-associates-title">Our Business Associates</h2>
            <p className="iz-associates-sub">
              Direct connection with our certified enterprise domain leads, cloud architects, and dedicated Tally specialists.
            </p>
          </div>

          <div className="iz-associates-grid">
            {ASSOCIATES.map((associate) => (
              <div key={associate.id} className="iz-associate-card">
                <div className="iz-card-top-row">
                  <img
                    src={associate.image}
                    alt={associate.name}
                    className="iz-associate-avatar"
                    loading="lazy"
                  />
                  <div className="iz-card-top-meta">
                    <LinkedInQRCode url={associate.linkedinUrl} size={46} title={associate.name} />
                  </div>
                </div>

                <div className="iz-card-body">
                  <h3 className="iz-associate-name">{associate.name}</h3>
                  <p className="iz-associate-role">{associate.role}</p>

                  <div className="iz-card-contact-lines">
                    <div className="iz-card-line">
                      <Phone size={15} />
                      <a href={`tel:${associate.phone.replace(/\s+/g, '')}`}>{associate.phone}</a>
                    </div>
                    <div className="iz-card-line">
                      <Mail size={15} />
                      <a href={`mailto:${associate.email}`}>{associate.email}</a>
                    </div>
                    <div className="iz-card-line">
                      <MapPin size={15} />
                      <span>{associate.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support Ticket Submission Form ────────────────────── */}
      <section className="help-ticket-section">
        <div className="help-container">
          <div className="help-ticket-card">
            <div className="help-ticket-header">
              <span className="help-section-badge">SUPPORT DESK FORM</span>
              <h2 className="help-ticket-title">Open a Priority Support Ticket</h2>
              <p className="help-ticket-desc">
                Fill in your issue details and our support engineer will contact you promptly.
              </p>
            </div>

            {submittedTicket ? (
              <div className="ticket-success-box">
                <CheckCircle2 size={48} className="ticket-success-icon" />
                <h3 className="ticket-success-title">Ticket Successfully Created!</h3>
                <p className="ticket-success-id">
                  Ticket Reference ID: <strong>#{submittedTicket}</strong>
                </p>
                <p className="ticket-success-desc">
                  An email confirmation has been logged. Our domain specialist has been notified and will call or remote-in shortly.
                </p>
                <button
                  type="button"
                  className="ticket-new-btn"
                  onClick={handleResetTicket}
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="help-form-grid">
                <div className="form-row-2">
                  <div className="help-form-group">
                    <label htmlFor="ticket-name">
                      Your Name <span className="req">*</span>
                    </label>
                    <input
                      id="ticket-name"
                      type="text"
                      name="name"
                      value={ticketForm.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Debasish Ghosh"
                      required
                    />
                  </div>

                  <div className="help-form-group">
                    <label htmlFor="ticket-phone">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      id="ticket-phone"
                      type="tel"
                      name="phone"
                      value={ticketForm.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9330113000"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="help-form-group">
                    <label htmlFor="ticket-email">
                      Email Address
                    </label>
                    <input
                      id="ticket-email"
                      type="email"
                      name="email"
                      value={ticketForm.email}
                      onChange={handleInputChange}
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="help-form-group">
                    <label htmlFor="ticket-category">
                      Service / Category
                    </label>
                    <select
                      id="ticket-category"
                      name="category"
                      value={ticketForm.category}
                      onChange={handleInputChange}
                    >
                      <option value="Tally Prime License & Installation">Tally Prime License & Installation</option>
                      <option value="Tally on Cloud Hosting">Tally on Cloud Hosting</option>
                      <option value="CtrlS / Azure / AWS Cloud Infrastructure">CtrlS / Azure / AWS Cloud Infrastructure</option>
                      <option value="IT Hardware, Servers & AMC Support">IT Hardware, Servers & AMC Support</option>
                      <option value="Cybersecurity & Firewall Configuration">Cybersecurity & Firewall Configuration</option>
                      <option value="Data Backup & Disaster Recovery">Data Backup & Disaster Recovery</option>
                      <option value="Billing, Invoicing & GST Receipt Inquiry">Billing, Invoicing & GST Receipt Inquiry</option>
                      <option value="General Technical Support">General Technical Support</option>
                    </select>
                  </div>
                </div>

                <div className="help-form-group">
                  <label htmlFor="ticket-subject">
                    Subject <span className="req">*</span>
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    name="subject"
                    value={ticketForm.subject}
                    onChange={handleInputChange}
                    placeholder="Brief summary of the issue (e.g. Tally client error code 104)"
                    required
                  />
                </div>

                <div className="help-form-group">
                  <label htmlFor="ticket-desc">
                    Detailed Description <span className="req">*</span>
                  </label>
                  <textarea
                    id="ticket-desc"
                    name="description"
                    rows={4}
                    value={ticketForm.description}
                    onChange={handleInputChange}
                    placeholder="Please include any error messages, workstation count, or specific urgency..."
                    required
                  />
                </div>

                <div className="help-form-submit-row">
                  <button
                    type="submit"
                    className="help-submit-btn"
                    disabled={isSubmitting}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────────── */}
      <section className="help-faq-section">
        <div className="help-container">
          <div className="help-faq-header">
            <span className="help-section-badge">QUICK ANSWERS</span>
            <h2 className="help-faq-title">Frequently Asked Questions</h2>
            <p className="help-faq-subtitle">
              Instant answers to common configuration, licensing, and cloud access questions.
            </p>
          </div>

          <div className="help-faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`help-faq-card ${isOpen ? 'open' : ''}`}
                  onClick={() => handleToggleFaq(index)}
                >
                  <div className="help-faq-question-row">
                    <h3 className="help-faq-question">{faq.q}</h3>
                    <ChevronDown size={18} className="faq-chevron" />
                  </div>
                  {isOpen && (
                    <div className="help-faq-answer-block">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Official Footer ───────────────────────────────────── */}
      <Footer />
    </div>
  );
}
