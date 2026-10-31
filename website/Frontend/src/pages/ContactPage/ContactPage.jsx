import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Navbar from '../Demo Page/sections/Navbar/Navbar';
import Footer from '../../components/Footer';
import LinkedInQRCode from '../../components/LinkedInQRCode';
import photoFinancialSpecialist from '../../assets/corporate_team_handshake.webp';
import photoMicrosoftCloudEng from '../../assets/office_engineers_collaborating.webp';
import photoDatacenterArchitect from '../../assets/client_team_celebration.webp';
import './ContactPage.css';

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    companyName: '',
    interestedIn: '',
    description: ''
  });

  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.description.trim()) return;

    if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('Incorrect captcha code. Please enter the characters shown.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setCaptchaError('');
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedTicket = 'NIS-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedTicket);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      companyName: '',
      interestedIn: '',
      description: ''
    });
    setCaptchaInput('');
    setCaptchaError('');
    generateCaptcha();
    setIsSubmitted(false);
    setTicketId('');
  };

  return (
    <div className="iz-contact-page">
      {/* Universal Floating Header */}
      <Navbar />

      {/* 1. Angled Hero Section with 3D Globe Mesh & Centered "CONTACT US" */}
      <section className="iz-hero-section">
        {/* 3D Dotted Globe Mesh (SVG) */}
        <div className="iz-hero-globe-mesh" aria-hidden="true">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="globeGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#00d2d3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
              </radialGradient>
            </defs>
            {/* Latitude / Longitude 3D Perspective Dots */}
            {Array.from({ length: 11 }).map((_, rIndex) => {
              const r = 25 + rIndex * 12;
              return Array.from({ length: 16 }).map((_, dIndex) => {
                const angle = (dIndex * 22.5 * Math.PI) / 180;
                const cx = 130 + r * Math.cos(angle) * 0.95;
                const cy = 130 + r * Math.sin(angle) * 0.55;
                const size = 1.2 + (rIndex / 11) * 2;
                return (
                  <circle
                    key={`${rIndex}-${dIndex}`}
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill="url(#globeGrad)"
                    opacity={0.3 + (dIndex % 3) * 0.25}
                  />
                );
              });
            })}
          </svg>
        </div>

        <div className="iz-hero-content">
          <h1 className="iz-hero-title">CONTACT US</h1>
        </div>
      </section>

      {/* 2. Main 2-Column Section: "Get In Touch" + "Your Detail" Card */}
      <section className="iz-main-section">
        <div className="iz-container">
          <div className="iz-grid">
            {/* Left Column: Get In Touch */}
            <div className="iz-touch-col">
              <h2 className="iz-touch-title">Get In Touch</h2>
              <p className="iz-touch-desc">
                Connect with our certified enterprise consultants, cloud architects, and dedicated Tally Prime support desk. We are here to power your organization's digital workflow.
              </p>

              <div className="iz-touch-items">
                {/* Contact Point 1: Kolkata Headquarters */}
                <div className="iz-touch-item">
                  <div className="iz-icon-circle">
                    <Building2 size={24} />
                  </div>
                  <div className="iz-item-info">
                    <span className="iz-item-heading">Salt Lake Sector-V, Kolkata</span>
                    <p className="iz-item-text">
                      Webel Tower 1, BN Block, Salt Lake City, Sector-V, Kolkata - 700091
                    </p>
                    <span className="iz-item-sub">Corporate Office</span>
                  </div>
                </div>

                {/* Contact Point 2: Business & Licensing Advisory */}
                <div className="iz-touch-item">
                  <div className="iz-icon-circle">
                    <Phone size={22} />
                  </div>
                  <div className="iz-item-info">
                    <span className="iz-item-heading">Business Solutions</span>
                     <p className="iz-item-text">
                      Landline <a href="tel:03340041899">033 - 4004 1899</a>
                    </p>
                    <p className="iz-item-text">
                      Mobile <a href="tel:+919330113000">+91 9330113000</a>
                    </p>
                    <span className="iz-item-sub">
                      Email: <a href="mailto:info@netinfotechsystem.com">info@netinfotechsystem.com</a>
                    </span>
                    <span className="iz-item-sub">
                      Email: <a href="mailto:nghosal@netinfotechsystem.com">nghosal@netinfotechsystem.com</a>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: "Your Detail" Floating Card */}
            <div className="iz-form-card">
              <p className="iz-card-title">Please fill your details here</p>

              {isSubmitted ? (
                <div className="iz-success-box">
                  <CheckCircle2 size={42} style={{ color: '#34d399', marginBottom: 10 }} />
                  <h4>Thank You!</h4>
                  <p>
                    Your enquiry has been received under Reference <strong>#{ticketId}</strong>. Our enterprise team will respond promptly.
                  </p>
                  <button type="button" onClick={handleReset} className="iz-reset-btn">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="iz-form">
                  <div className="iz-form-row">
                    <div className="iz-input-group">
                      <label className="iz-input-label">
                        Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Full Name"
                        className="iz-input-underline"
                        required
                      />
                    </div>

                    <div className="iz-input-group">
                      <label className="iz-input-label">
                        Email <span>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email Address"
                        className="iz-input-underline"
                        required
                      />
                    </div>
                  </div>

                  <div className="iz-form-row">
                    <div className="iz-input-group">
                      <label className="iz-input-label">
                        Mobile <span>*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Your Mobile Number"
                        className="iz-input-underline"
                        required
                      />
                    </div>

                    <div className="iz-input-group">
                      <label className="iz-input-label">
                        Company/Bussiness name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your Company / Business Name"
                        className="iz-input-underline"
                      />
                    </div>
                  </div>

                  <div className="iz-input-group">
                    <label className="iz-input-label">
                      Interested in <span>*</span>
                    </label>
                    <select
                      name="interestedIn"
                      value={formData.interestedIn}
                      onChange={handleChange}
                      className="iz-input-underline"
                      required
                    >
                      <option value="">Select an option...</option>
                      <option value="Tally Prime Solutions & Customization">Tally Prime Solutions & Customization</option>
                      <option value="Cloud Hosting & Infrastructure (AWS / Azure / CtrlS)">Cloud Hosting & Infrastructure (AWS / Azure / CtrlS)</option>
                      <option value="Enterprise ERP & Custom Software Development">Enterprise ERP & Custom Software Development</option>
                      <option value="IT Hardware, Servers & AMC Support">IT Hardware, Servers & AMC Support</option>
                      <option value="Cybersecurity & Network Infrastructure">Cybersecurity & Network Infrastructure</option>
                      <option value="Data Backup & Disaster Recovery">Data Backup & Disaster Recovery</option>
                      <option value="Web Development & Digital Solutions">Web Development & Digital Solutions</option>
                      <option value="Corporate IT Advisory & Consulting">Corporate IT Advisory & Consulting</option>
                      <option value="Other / General Inquiry">Other / General Inquiry</option>
                    </select>
                  </div>

                  <div className="iz-input-group">
                    <label className="iz-input-label">
                      Description <span>*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Briefly describe your requirements or query..."
                      className="iz-input-underline iz-textarea-underline"
                      required
                    />
                  </div>

                  {/* Captcha Verification Section */}
                  <div className="iz-captcha-group">
                    <label className="iz-input-label">
                      Security Verification <span>*</span>
                    </label>
                    <div className="iz-captcha-box">
                      <div className="iz-captcha-display" aria-label="Captcha security code">
                        <div className="iz-captcha-noise" aria-hidden="true" />
                        <span className="iz-captcha-text">{captchaCode}</span>
                      </div>
                      <button
                        type="button"
                        className="iz-captcha-refresh-btn"
                        onClick={generateCaptcha}
                        title="Generate new Captcha code"
                        aria-label="Refresh Captcha"
                      >
                        <RefreshCw size={17} className={isSpinning ? 'spin' : ''} />
                      </button>
                    </div>
                    <input
                      type="text"
                      name="captchaInput"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        if (captchaError) setCaptchaError('');
                      }}
                      placeholder="Enter the 6-character code shown above"
                      className={`iz-input-underline ${captchaError ? 'iz-input-error' : ''}`}
                      autoComplete="off"
                      required
                    />
                    {captchaError && <span className="iz-captcha-error-text">{captchaError}</span>}
                  </div>

                  <button type="submit" disabled={isSubmitting} className="iz-submit-btn">
                    {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Horizontal Business Associates Section (Placed Before Map) */}
      <section className="iz-associates-section">
        <div className="iz-container">
          <div className="iz-associates-header">
            <h4 className="iz-associates-title">Our Business Associates</h4>
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

      {/* 4. Full-Width Interactive Google Map Section (Directly Above Footer) */}
      <section className="iz-map-section">
        {/* Floating Verified Location Spotlight Card */}
        <div className="iz-map-spotlight-card">
          <div className="iz-map-spotlight-header">
            <div className="iz-map-pin-icon">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="iz-map-spotlight-title">Net Infotech System Pvt. Ltd.</h4>
              <span className="iz-map-spotlight-sub">Corporate Office</span>
            </div>
          </div>
          <p className="iz-map-spotlight-address">
            Room No. 105, 1st Floor, Webel Tower 1, IT Park, BN Block, Sector V, Salt Lake City, Kolkata – 700091
          </p>
          <div className="iz-map-spotlight-actions">
            <a
              href="https://maps.google.com/?q=Net+Infotech+System+Webel+Tower+1+Sector+V+Kolkata"
              target="_blank"
              rel="noopener noreferrer"
              className="iz-map-directions-btn"
            >
              <span>Get Directions</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <iframe
          title="Net Infotech System Kolkata Location"
          src="https://maps.google.com/maps?q=Net+Infotech+System,+Webel+Tower+1,+Sector+V,+Salt+Lake,+Kolkata&t=&z=16&ie=UTF8&iwloc=&output=embed"
          className="iz-map-frame"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen=""
        />
      </section>

      {/* Universal Official Footer */}
      <Footer />
    </div>
  );
}
