import React, { useState } from 'react';
import { Building2, ShieldCheck, Award, Users, CheckCircle2, ArrowRight, Sparkles, MapPin, Calendar, Layers } from 'lucide-react';
import { OUR_CLIENTS_DATA } from '../data/mockData';
import { useScrollReveal } from '../utils/useScrollReveal';
import './OurClientsSection.css';

export default function OurClientsSection({ onOpenDemo }) {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState('All');

  const categories = [
    'All',
    'Manufacturing & Steel',
    'Retail & Commerce',
    'Healthcare & Pharma',
    'Logistics & Transport',
    'Engineering & Construction',
    'Finance & IT'
  ];

  const filteredClients = activeTab === 'All'
    ? OUR_CLIENTS_DATA
    : OUR_CLIENTS_DATA.filter(c => c.category === activeTab);

  // Duplicate client items for the top ticker marquee
  const logoTickerList = [...OUR_CLIENTS_DATA, ...OUR_CLIENTS_DATA];

  return (
    <section className="nis-clients-section reveal-fade-up">
      <div className="container">
        
        {/* SECTION HEADER */}
        <div className="section-title-center reveal-fade-up">
          <div className="nis-section-badge">
            <Building2 size={14} />
            <span>TRUSTED BY 1,5000+ ENTERPRISES</span>
          </div>
          <h2 className="nis-section-h2">
            Our <span className="gradient-text">Valued Clients</span> & Partners
          </h2>
          <p className="nis-section-sub">
            For over 25 years, top industrial houses, retail chains, healthcare networks, and logistics leaders across West Bengal and India rely on Net Infotech System Pvt. Ltd.
          </p>
        </div>

        {/* TRUST STATS COUNTER BAR */}
        <div className="clients-stats-bar reveal-scale">
          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Building2 size={22} color="#0284C7" />
            </div>
            <div className="stat-text">
              <span className="stat-number">1,5000+</span>
              <span className="stat-label">Enterprise Clients</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Award size={22} color="#7C3AED" />
            </div>
            <div className="stat-text">
              <span className="stat-number">25+ Yrs</span>
              <span className="stat-label">Industry Leadership</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <ShieldCheck size={22} color="#059669" />
            </div>
            <div className="stat-text">
              <span className="stat-number">99.8%</span>
              <span className="stat-label">SLA & Retention</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Users size={22} color="#D97706" />
            </div>
            <div className="stat-text">
              <span className="stat-number">50+</span>
              <span className="stat-label">Certified IT Engineers</span>
            </div>
          </div>
        </div>

        {/* AUTO HORIZONTAL LOGO TICKER MARQUEE */}
        <div className="client-logo-marquee-wrapper reveal-fade-up">
          <div className="client-logo-marquee-label">Featured Corporate Partners:</div>
          <div className="client-logo-marquee-track-container">
            <div className="client-logo-marquee-track">
              {logoTickerList.map((client, idx) => (
                <div key={`logo-${client.id}-${idx}`} className="client-logo-pill">
                  <div 
                    className="client-logo-icon-emblem" 
                    style={{ background: client.logoColor }}
                  >
                    {client.logoText.slice(0, 2)}
                  </div>
                  <span className="client-logo-name">{client.name}</span>
                  <span className="client-logo-badge">{client.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="clients-filter-bar reveal-fade-up">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`clients-tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat === 'All' ? 'All Industries' : cat}
            </button>
          ))}
        </div>

        {/* CLIENT CARDS GRID */}
        <div className="clients-cards-grid reveal-fade-up">
          {filteredClients.map((client, index) => (
            <div 
              key={client.id} 
              className="client-card reveal-scale"
              style={{ transitionDelay: `${(index % 3) * 0.12}s` }}
            >
              
              {/* CARD TOP HEADER */}
              <div className="client-card-header">
                <div 
                  className="client-brand-logo-box" 
                  style={{ background: `linear-gradient(135deg, ${client.logoColor}, #0F172A)` }}
                >
                  <span className="client-logo-code">{client.logoText.slice(0, 3)}</span>
                </div>

                <div className="client-header-title">
                  <h3 className="client-name">{client.name}</h3>
                  <div className="client-meta-row">
                    <span className="client-category-tag">{client.category}</span>
                    <span className="client-location-tag">
                      <MapPin size={12} /> {client.location}
                    </span>
                  </div>
                </div>

                <span className="client-metric-pill">{client.badge}</span>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="client-card-body">
                <div className="client-detail-row">
                  <div className="client-detail-label">
                    <Layers size={14} color="#0284C7" />
                    <span>Deployed Solution:</span>
                  </div>
                  <div className="client-detail-val">{client.serviceUsed}</div>
                </div>

                <div className="client-detail-row">
                  <div className="client-detail-label">
                    <Calendar size={14} color="#059669" />
                    <span>Relationship:</span>
                  </div>
                  <div className="client-detail-val">{client.partnership}</div>
                </div>

                <div className="client-quote-box">
                  <p className="client-quote-text">"{client.quote}"</p>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="client-card-footer">
                <span className="client-verified-badge">
                  <CheckCircle2 size={13} color="#059669" /> Active Enterprise SLA
                </span>
                {onOpenDemo && (
                  <button 
                    type="button" 
                    className="client-card-action"
                    onClick={onOpenDemo}
                  >
                    <span>Request Quote</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* CALL TO ACTION AT FOOTER OF CLIENTS SECTION */}
        <div className="clients-footer-banner reveal-scale">
          <div className="clients-fb-content">
            <h3>Join 1,5000+ Businesses Thriving with Net Infotech System</h3>
            <p>Get a customized IT Infrastructure assessment or Tally on Cloud trial for your enterprise today.</p>
          </div>
          {onOpenDemo && (
            <button 
              type="button" 
              className="clients-fb-btn"
              onClick={onOpenDemo}
            >
              <Sparkles size={16} />
              <span>Partner With Us</span>
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
