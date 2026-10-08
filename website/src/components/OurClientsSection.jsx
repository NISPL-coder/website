import { useState } from 'react';
import { Building2, ShieldCheck, Award, Users } from 'lucide-react';
import sfdcLogo from '../assets/SFDC_logo.png';
import teaBoardLogo from '../assets/tea_board_logo.png';
import { useScrollReveal } from '../utils/useScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import './OurClientsSection.css';

/* Original Company Logo Image Links */
const CLIENT_LOGOS = [
  {
    id: 1,
    name: "Tata Steel",
    logoUrl: "https://cdn.brandfetch.io/tatasteel.com/w/400/h/400",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg",
    color: "#0052CC"
  },
  {
    id: 2,
    name: "Larsen & Toubro",
    logoUrl: "https://cdn.brandfetch.io/larsentoubro.com/w/400/h/400",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/L%26T.png",
    color: "#005691"
  },
  {
    id: 3,
    name: "ITC Limited",
    logoUrl: "https://cdn.brandfetch.io/itcportal.com/w/400/h/400",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/ITC_Limited_Logo.svg",
    color: "#B91C1C"
  },
  {
    id: 4,
    name: "Govt. of West Bengal (SFDC)",
    logoUrl: sfdcLogo,
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Emblem_of_West_Bengal.svg",
    color: "#0284C7"
  },
  {
    id: 5,
    name: "Tea Board of India",
    logoUrl: teaBoardLogo,
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Emblem_of_India.svg",
    color: "#15803D"
  },
  {
    id: 6,
    name: "Reliance Industries",
    logoUrl: "https://cdn.brandfetch.io/ril.com/w/400/h/400",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/en/9/99/Reliance_Industries_Logo.svg",
    color: "#C026D3"
  },
  {
    id: 7,
    name: "Emami Group",
    logoUrl: "https://cdn.brandfetch.io/emamigroup.com/w/400/h/400",
    color: "#E11D48"
  },
  {
    id: 8,
    name: "Exide Industries",
    logoUrl: "https://cdn.brandfetch.io/exideindustries.com/w/400/h/400",
    color: "#EA580C"
  }
];

function ClientLogoCard({ client }) {
  const [imgSrc, setImgSrc] = useState(client.logoUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (client.fallbackUrl && imgSrc !== client.fallbackUrl) {
      setImgSrc(client.fallbackUrl);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="minimal-client-logo-card">
      {!hasError ? (
        <img 
          src={imgSrc} 
          alt={`${client.name} Original Logo`} 
          className="original-client-logo-img"
          onError={handleError}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: client.color, color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem' }}>
            {client.name.slice(0, 4)}
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#062B4F' }}>{client.name}</span>
        </div>
      )}
    </div>
  );
}

export default function OurClientsSection() {
  useScrollReveal();

  return (
    <section className="nis-clients-section reveal-fade-up">
      <div className="container">
        
        {/* SECTION HEADER */}
        <div className="section-title-center reveal-fade-up">
          <div className="nis-section-badge">
            <Building2 size={14} />
            <span>TRUSTED BY LEADING ENTERPRISES</span>
          </div>
          <h2 className="nis-section-h2">
            Our <span className="gradient-text">Valued Clients</span> & Partners
          </h2>
          <p className="nis-section-sub">
            India's leading corporate houses, government entities, healthcare institutions, and enterprise leaders rely on Net Infotech System.
          </p>
        </div>

        {/* TRUST STATS COUNTER BAR */}
        <div className="clients-stats-bar reveal-scale">
          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Building2 size={22} color="#0284C7" />
            </div>
            <div className="stat-text">
              <span className="stat-number">
                <AnimatedCounter value="2,500+" duration={2200} />
              </span>
              <span className="stat-label">Enterprise Clients</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Award size={22} color="#7C3AED" />
            </div>
            <div className="stat-text">
              <span className="stat-number">
                <AnimatedCounter value="26+ Yrs" duration={1800} />
              </span>
              <span className="stat-label">Industry Leadership</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <ShieldCheck size={22} color="#059669" />
            </div>
            <div className="stat-text">
              <span className="stat-number">
                <AnimatedCounter value="99.8%" duration={2000} decimals={1} />
              </span>
              <span className="stat-label">SLA & Retention</span>
            </div>
          </div>

          <div className="client-stat-divider" />

          <div className="client-stat-item">
            <div className="stat-icon-wrapper">
              <Users size={22} color="#D97706" />
            </div>
            <div className="stat-text">
              <span className="stat-number">
                <AnimatedCounter value="50+" duration={1800} />
              </span>
              <span className="stat-label">Certified IT Engineers</span>
            </div>
          </div>
        </div>

        {/* MINIMAL CLIENT LOGO SHOWCASE GRID WITH ORIGINAL LOGO IMAGES */}
        <div className="minimal-client-logos-grid reveal-fade-up">
          {CLIENT_LOGOS.map((client) => (
            <ClientLogoCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </section>
  );
}
