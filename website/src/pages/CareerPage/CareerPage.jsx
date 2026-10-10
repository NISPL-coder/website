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
  MessageSquare,
  UploadCloud
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
    id: 'tally-consultant',
    title: 'TallyPrime Consultant',
    department: 'ERP & Business Solutions',
    category: 'erp',
    badge: 'Certified',
    experience: '2 – 5 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Implement TallyPrime workflows, GST compliance, and integrations for corporate clients.',
    skills: ['TallyPrime', 'GST', 'Cloud Tally']
  },
  {
    id: 'security-engineer',
    title: 'Network Security Engineer',
    department: 'IT Infrastructure & AMC',
    category: 'infra',
    badge: 'Priority',
    experience: '2 – 5 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Configure and maintain next-gen firewalls, routing, and zero-trust security policies.',
    skills: ['Firewalls', 'Routing', 'AMC']
  },
  {
    id: 'cloud-migration',
    title: 'Cloud Migration Specialist',
    department: 'Cloud & DevOps',
    category: 'cloud',
    badge: 'Open',
    experience: '1 – 3 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Execute seamless data migrations, virtual machine deployments, and system maintenance.',
    skills: ['Windows Server', 'Hyper-V', 'Backups']
  },
  {
    id: 'erp-support',
    title: 'ERP Technical Support',
    department: 'ERP & Business Solutions',
    category: 'erp',
    badge: 'Open',
    experience: '1 – 3 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Provide tier-2 technical resolution for TallyPrime and integrated business modules.',
    skills: ['TallyPrime', 'Support', 'Accounting']
  },
  {
    id: 'sales-executive',
    title: 'IT Sales Manager',
    department: 'Business Development',
    category: 'sales',
    badge: 'Hiring',
    experience: '2 – 5 Years',
    type: 'Full-Time',
    location: 'Salt Lake Sector-V, Kolkata',
    description: 'Drive corporate B2B client acquisition for enterprise cloud hosting and ERP projects.',
    skills: ['B2B Sales', 'Tech Sales', 'Client Engagement']
  }
];

export default function CareerPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    source: '',
    description: '',
    resume: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef(null);

  const filteredJobs = JOBS.filter((job) => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleApplyClick = () => {
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
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        resume: e.target.files[0]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        organisation: '',
        source: '',
        description: '',
        resume: null
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="iz-career-page-root">
      <Navbar />

      {/* =====================================================================
          1. OPEN POSITIONS BOARD
          ===================================================================== */}
      <section className="iz-career-jobs-section" id="open-roles">
        <div className="iz-career-container">
          <div className="iz-career-section-header">
            <h2 className="iz-career-section-title">Shape the Future of Enterprise IT</h2>
            <p className="iz-career-section-desc">
              Join a team of certified professionals delivering high-impact cloud, ERP, and security solutions to 1000+ corporate clients.
            </p>
          </div>

          <div className="iz-career-filter-bar">
            <div className="iz-career-filter-tabs">
              <button 
                type="button" 
                className={`iz-career-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Roles
              </button>
              <button 
                type="button" 
                className={`iz-career-tab ${selectedCategory === 'cloud' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('cloud')}
              >
                Cloud &amp; DevOps
              </button>
              <button 
                type="button" 
                className={`iz-career-tab ${selectedCategory === 'erp' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('erp')}
              >
                ERP Solutions
              </button>
              <button 
                type="button" 
                className={`iz-career-tab ${selectedCategory === 'infra' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('infra')}
              >
                Security &amp; AMC
              </button>
            </div>

            <div className="iz-career-search-box">
              <Search size={18} className="iz-career-search-icon" />
              <input 
                type="text"
                placeholder="Search by keyword or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="iz-career-search-input"
              />
            </div>
          </div>

          <div className="iz-career-jobs-grid">
            {filteredJobs.length === 0 ? (
              <div className="iz-career-no-results">
                <p>No open positions match your search criteria. Please try a different keyword.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="iz-career-job-card">
                  <div>
                    <div className="iz-career-job-header">
                      <span className="iz-career-dept-pill">{job.department}</span>
                      <span className="iz-career-status-badge">{job.badge}</span>
                    </div>
                    <h3 className="iz-career-job-title">{job.title}</h3>
                    <p className="iz-career-job-desc">{job.description}</p>
                    
                    <div className="iz-career-skills-list">
                      {job.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="iz-career-skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="iz-career-job-meta-row">
                      <div className="iz-career-meta-item">
                        <Clock size={16} />
                        <span>{job.experience}</span>
                      </div>
                      <div className="iz-career-meta-item">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="iz-career-job-apply-btn"
                      onClick={handleApplyClick}
                    >
                      <span>Apply For Position</span>
                      <div className="iz-icon-wrap">
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  </div>
                </div>
              ))
            )}
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
              <form onSubmit={handleSubmit}>
                <div className="iz-career-input-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    className="iz-career-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="iz-career-input-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    className="iz-career-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="iz-career-input-group">
                  <label htmlFor="organisation">Organisation</label>
                  <input 
                    type="text" 
                    id="organisation"
                    name="organisation"
                    className="iz-career-input"
                    placeholder="Current Company / University"
                    value={formData.organisation}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="iz-career-input-group">
                  <label htmlFor="source">How did you hear about us?</label>
                  <select 
                    id="source"
                    name="source"
                    className="iz-career-select"
                    value={formData.source}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed / Naukri">Indeed / Naukri</option>
                    <option value="Referral">Employee Referral</option>
                    <option value="Website">Company Website</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="iz-career-input-group">
                  <label htmlFor="description">Brief Description / Cover Letter</label>
                  <textarea 
                    id="description"
                    name="description"
                    className="iz-career-textarea"
                    placeholder="Tell us about your experience and why you'd be a great fit..."
                    value={formData.description}
                    onChange={handleChange}
                    required 
                  ></textarea>
                </div>

                <div className="iz-career-input-group">
                  <label htmlFor="resume">Upload Resume (PDF, DOCX)</label>
                  <div className="iz-career-file-upload">
                    <input 
                      type="file" 
                      id="resume"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="iz-career-file-input"
                      required
                    />
                    <div className="iz-career-file-label">
                      <UploadCloud size={20} />
                      <span>{formData.resume ? formData.resume.name : 'Click to select or drag and drop your resume'}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="iz-career-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Application...' : (
                    <>
                      <span>Submit Application</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
                {isSubmitted && (
                  <p style={{ marginTop: '16px', color: '#10B981', fontWeight: '600', textAlign: 'center' }}>
                    Application submitted successfully! We will contact you soon.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
