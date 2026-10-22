import React, { useState, useRef } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  ArrowRight,
  Send,
  Building,
  User,
  Mail,
  Phone,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X
} from 'lucide-react';
import Navbar from '../Demo Page/sections/Navbar/Navbar';
import Footer from '../../components/Footer';
import './CareerPage.css';

const JOBS = [
  {
    id: 'cloud-arch',
    title: 'Cloud & Infrastructure Architect',
    department: 'Cloud & DevOps',
    category: 'cloud',
    badge: 'Immediate',
    experience: '3 – 6 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Architect scalable enterprise cloud environments and lead automated migrations.',
    skills: ['AWS / Azure', 'VMware', 'NOC Ops']
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Automation Engineer',
    department: 'Cloud & DevOps',
    category: 'cloud',
    badge: 'Open',
    experience: '2 – 5 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Implement CI/CD pipelines, container orchestration, and automate infrastructure deployments.',
    skills: ['Docker', 'Kubernetes', 'Jenkins']
  },
  {
    id: 'sales-manager',
    title: 'IT Sales Manager',
    department: 'Business Development',
    category: 'bd',
    badge: 'Priority',
    experience: '3 – 6 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Drive corporate B2B client acquisition for enterprise cloud hosting and ERP projects.',
    skills: ['B2B Sales', 'Tech Sales', 'Client Engagement']
  },
  {
    id: 'business-analyst',
    title: 'Pre-Sales Business Analyst',
    department: 'Business Development',
    category: 'bd',
    badge: 'Open',
    experience: '2 – 4 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Understand client requirements, prepare proposals, and assist in solution design presentations.',
    skills: ['Requirements Gathering', 'Proposals', 'Client Facing']
  },
  {
    id: 'hr-executive',
    title: 'Senior HR Executive',
    department: 'HR',
    category: 'hr',
    badge: 'Hiring',
    experience: '3 – 5 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Manage talent acquisition, employee engagement, and enforce company policies.',
    skills: ['Recruitment', 'Operations', 'Compliance']
  },
  {
    id: 'it-recruiter',
    title: 'Technical IT Recruiter',
    department: 'HR',
    category: 'hr',
    badge: 'Open',
    experience: '1 – 3 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Source, screen, and recruit technical talent for cloud, development, and support teams.',
    skills: ['Sourcing', 'Screening', 'Negotiation']
  }
];

export default function CareerPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appliedRole: '',
    resume: null,
    website: '' // Honeypot field
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const formRef = useRef(null);

  const filteredJobs = JOBS.filter((job) => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleApplyClick = (jobTitle) => {
    if (jobTitle) {
      setFormData((prev) => ({
        ...prev,
        appliedRole: jobTitle
      }));
      setFieldErrors((prev) => ({ ...prev, appliedRole: '' }));
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setFieldErrors((prev) => ({
          ...prev,
          resume: 'Invalid file format. Please upload a PDF, DOC, or DOCX resume.'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          resume: 'Resume file size exceeds the 5MB limit. Please upload a smaller file.'
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        resume: file
      }));
      setFieldErrors((prev) => ({ ...prev, resume: '' }));
      if (submitError) setSubmitError('');
    }
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters).';
    }

    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.phone || !phoneRegex.test(formData.phone.trim().replace(/\s+/g, ''))) {
      errors.phone = 'Please provide a valid phone number (at least 10 digits).';
    }

    if (!formData.appliedRole || !formData.appliedRole.trim()) {
      errors.appliedRole = 'Please select or enter the role you are applying for.';
    }

    if (!formData.resume) {
      errors.resume = 'Please upload your resume (PDF, DOC, or DOCX).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Honeypot check
    if (formData.website) {
      // Silently simulate success for bots
      setIsSubmitted(true);
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formData.phone.trim());
      data.append('appliedRole', formData.appliedRole.trim());
      data.append('resume', formData.resume);
      data.append('website', formData.website || '');

      // Support configurable API base URL or relative endpoint
      const apiEndpoint = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/career/apply`
        : '/api/career/apply';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || `Submission failed with status ${response.status}. Please try again.`
        );
      }

      if (result && result.success) {
        setIsSubmitted(true);
        setSubmissionResult({
          applicationId: result.data?.applicationId || 'Recorded',
          candidateName: formData.name.trim(),
          appliedRole: formData.appliedRole.trim(),
          timestamp: result.data?.dateTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          status: result.data?.status || 'New'
        });
      } else {
        throw new Error(result?.message || 'Unable to record application. Please try again.');
      }
    } catch (err) {
      console.error('Career application submission error:', err);
      setSubmitError(
        err.message || 'Network error or backend unavailable. Please check your connection and retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      appliedRole: '',
      resume: null,
      website: ''
    });
    setFieldErrors({});
    setSubmitError('');
    setIsSubmitted(false);
    setSubmissionResult(null);
  };

  return (
    <div className="iz-career-page-root">
      <Navbar />

      {/* =====================================================================
          0. HERO HEADER WITH 3D NETWORK GLOBE MESH & ANGLED CUT
          ===================================================================== */}
      <section className="iz-hero-section">
        {/* 3D Dotted Globe Network Mesh (SVG) */}
        <div className="iz-hero-globe-mesh" aria-hidden="true">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="globeGradCareer" cx="40%" cy="40%" r="60%">
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
                    fill="url(#globeGradCareer)"
                    opacity={0.3 + (dIndex % 3) * 0.25}
                  />
                );
              });
            })}
          </svg>
        </div>

        <div className="iz-hero-content">
          <h1>Build the Future of Enterprise IT</h1>
        </div>
      </section>

      {/* =====================================================================
          1. WHY NET INFOTECH SYSTEM SECTION
          ===================================================================== */}
      <section className="iz-career-why-section" id="why-nispl">
        <div className="iz-career-container">
          

          <div className="iz-career-why-card">
            <div className="iz-career-why-content">
              <div className="iz-career-section-header">
           
            <h2 className="iz-career-section-title">Why NISPL</h2>
          </div>
              <p className="iz-career-why-paragraph">
                Established in 2000, Net Infotech System has evolved with a clear vision to simplify technology and empower businesses to achieve more. Incorporated as Net Infotech System Pvt. Ltd. (NISPL) on 21 July 2022, we continue to build on our legacy of trust, expertise, and innovation.
              </p>
              <p className="iz-career-why-paragraph">
                As a trusted IT solutions provider and Tally Partner, we deliver integrated technology solutions spanning TallyPrime, Tally on Cloud, IT Infrastructure, Enterprise Cloud, Cloud Server &amp; Hosting, Cyber Security, Managed IT Services, and Microsoft Licensing. From server and network management to cloud migration, Wi-Fi, CCTV, endpoint protection, Microsoft 365, Windows Server, Azure, AWS, and IT AMC, we help businesses stay secure, connected, efficient, and future-ready.
              </p>
              <p className="iz-career-why-paragraph">
                By combining proven expertise with emerging technologies, we transform complex IT challenges into opportunities for growth, enabling organizations to innovate confidently and scale seamlessly.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. OPEN POSITIONS BOARD
          ===================================================================== */}
      <section className="iz-career-jobs-section" id="open-roles">
        <div className="iz-career-container">
          <div className="iz-career-section-header">
            <h2 className="iz-career-section-title">Explore Open Roles</h2>
            <p className="iz-career-section-desc">
              Discover opportunities that challenge, inspire, and reward your passion for technology.
            </p>
          </div>

          <div className="iz-career-layout-split">
            <div className="iz-career-sidebar">
              <button 
                type="button" 
                className={`iz-career-sidebar-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Roles
              </button>
              <button 
                type="button" 
                className={`iz-career-sidebar-tab ${selectedCategory === 'hr' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('hr')}
              >
                HR
              </button>
              <button 
                type="button" 
                className={`iz-career-sidebar-tab ${selectedCategory === 'bd' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('bd')}
              >
                Business Development
              </button>
              <button 
                type="button" 
                className={`iz-career-sidebar-tab ${selectedCategory === 'cloud' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('cloud')}
              >
                Cloud &amp; DevOps
              </button>
            </div>

            <div className="iz-career-jobs-list">
              {filteredJobs.length === 0 ? (
                <div className="iz-career-no-results">
                  <p>No open positions match your search criteria. Please try a different keyword.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="iz-career-simple-card" 
                    onClick={() => handleApplyClick(job.title)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleApplyClick(job.title); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Apply for ${job.title}`}
                  >
                    <div className="iz-career-simple-info">
                      <h3 className="iz-career-simple-title">{job.title}</h3>
                      <span className="iz-career-simple-exp">({job.experience})</span>
                    </div>
                    <div className="iz-career-simple-icon-wrap">
                      <User size={28} strokeWidth={1.5} color="#FFFFFF" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. APPLICATION FORM
          ===================================================================== */}
      <section className="iz-career-form-section" ref={formRef}>
        <div className="iz-career-container">
          <div className="iz-career-form-container">
            <div className="iz-career-form-info">
              <h2>Ready to make an impact?</h2>
              <p>
                Whether you're applying for a specific role or just want to connect for future opportunities, drop your details below. Our talent acquisition team will review your profile and reach out to you within 48 business hours.
              </p>
            </div>
            
            <div className="iz-career-form-card">
              {isSubmitted && submissionResult ? (
                <div className="iz-career-success-card" role="alert" aria-live="polite">
                  <div className="iz-career-success-icon-wrap">
                    <CheckCircle2 size={48} color="#10B981" />
                  </div>
                  <h3 className="iz-career-success-title">Application Submitted Successfully!</h3>
                  <p className="iz-career-success-desc">
                    Thank you, <strong>{submissionResult.candidateName}</strong>. Your application for <strong>{submissionResult.appliedRole}</strong> has been securely recorded.
                  </p>

                  <div className="iz-career-success-details">
                    <div className="iz-career-success-row">
                      <span>Application ID:</span>
                      <strong className="iz-career-app-id">{submissionResult.applicationId}</strong>
                    </div>
                    <div className="iz-career-success-row">
                      <span>Submitted At:</span>
                      <span>{submissionResult.timestamp}</span>
                    </div>
                    <div className="iz-career-success-row">
                      <span>Status:</span>
                      <span className="iz-career-status-pill">{submissionResult.status || 'New'}</span>
                    </div>
                  </div>

                  <p className="iz-career-success-note">
                    A notification has been routed to our HR team at <code>netinfotechsystem@gmail.com</code>. We will review your profile and reach out to you shortly.
                  </p>

                  <button
                    type="button"
                    className="iz-career-reset-btn"
                    onClick={handleResetForm}
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {submitError && (
                    <div className="iz-career-error-banner" role="alert">
                      <AlertCircle size={20} className="iz-career-error-icon" />
                      <div className="iz-career-error-text">
                        <strong>Submission Error:</strong> {submitError}
                      </div>
                      <button
                        type="button"
                        className="iz-career-error-dismiss"
                        onClick={() => setSubmitError('')}
                        aria-label="Dismiss error"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Anti-spam honeypot (invisible to real candidates) */}
                  <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <label htmlFor="iz-website-hp">Website</label>
                    <input
                      type="text"
                      id="iz-website-hp"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="iz-career-input-group">
                    <label htmlFor="name">
                      Candidate Name <span className="iz-required-star">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      className={`iz-career-input ${fieldErrors.name ? 'iz-input-invalid' : ''}`}
                      placeholder="e.g. Debasish Ray"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required 
                    />
                    {fieldErrors.name && <span className="iz-field-error-msg">{fieldErrors.name}</span>}
                  </div>
                  
                  <div className="iz-career-input-group">
                    <label htmlFor="email">
                      Email Address <span className="iz-required-star">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      className={`iz-career-input ${fieldErrors.email ? 'iz-input-invalid' : ''}`}
                      placeholder="e.g. debasish@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required 
                    />
                    {fieldErrors.email && <span className="iz-field-error-msg">{fieldErrors.email}</span>}
                  </div>

                  <div className="iz-career-input-group">
                    <label htmlFor="phone">
                      Phone Number <span className="iz-required-star">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      className={`iz-career-input ${fieldErrors.phone ? 'iz-input-invalid' : ''}`}
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required 
                    />
                    {fieldErrors.phone && <span className="iz-field-error-msg">{fieldErrors.phone}</span>}
                  </div>

                  <div className="iz-career-input-group">
                    <label htmlFor="appliedRole">
                      Applied Role <span className="iz-required-star">*</span>
                    </label>
                    <select
                      id="appliedRole"
                      name="appliedRole"
                      className={`iz-career-input iz-career-select ${fieldErrors.appliedRole ? 'iz-input-invalid' : ''}`}
                      value={formData.appliedRole}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Select a Position / Role...</option>
                      {JOBS.map((j) => (
                        <option key={j.id} value={j.title}>{j.title} ({j.department})</option>
                      ))}
                      <option value="General Application / Other IT Role">General Application / Other IT Role</option>
                    </select>
                    {fieldErrors.appliedRole && <span className="iz-field-error-msg">{fieldErrors.appliedRole}</span>}
                  </div>

                  <div className="iz-career-input-group">
                    <label htmlFor="resume">
                      Resume Upload (PDF, DOC, DOCX — Max 5MB) <span className="iz-required-star">*</span>
                    </label>
                    <div className={`iz-career-file-upload ${fieldErrors.resume ? 'iz-file-invalid' : ''}`}>
                      <input 
                        type="file" 
                        id="resume"
                        name="resume"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        className="iz-career-file-input"
                        disabled={isSubmitting}
                        required
                      />
                      <div className="iz-career-file-label">
                        <UploadCloud size={22} className="iz-upload-icon" />
                        <div className="iz-upload-text-wrap">
                          <span className="iz-upload-filename">
                            {formData.resume ? formData.resume.name : 'Click to browse or drop your resume here'}
                          </span>
                          <span className="iz-upload-hint">Supported: PDF, DOC, DOCX up to 5 MB</span>
                        </div>
                      </div>
                    </div>
                    {formData.resume && (
                      <div className="iz-file-meta-tag">
                        <FileText size={14} />
                        <span>{(formData.resume.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    )}
                    {fieldErrors.resume && <span className="iz-field-error-msg">{fieldErrors.resume}</span>}
                  </div>

                  <button 
                    type="submit" 
                    className="iz-career-submit-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="iz-spin-anim" />
                        <span>Uploading &amp; Recording Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
