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
          0. HERO HEADER
          ===================================================================== */}
      <section className="iz-career-hero-section">
        <div className="iz-career-hero-content">
          
        </div>
      </section>

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
                  <div key={job.id} className="iz-career-simple-card" onClick={handleApplyClick}>
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
              <form onSubmit={handleSubmit}>
                <div className="iz-career-input-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    className="iz-career-input"
                    placeholder="Enter your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="iz-career-input-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    className="iz-career-input"
                    placeholder="Enter your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
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
