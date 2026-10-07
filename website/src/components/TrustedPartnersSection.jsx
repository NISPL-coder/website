import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TrustedPartnersSection.css';

/* ── Authentic SVG / Styled Brand Logos ── */
const MicrosoftLogo = () => (
  <div className="partner-logo-content">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '16px', height: '16px', flexShrink: 0 }}>
      <div style={{ background: '#F25022' }} />
      <div style={{ background: '#7FBA00' }} />
      <div style={{ background: '#00A4EF' }} />
      <div style={{ background: '#FFB900' }} />
    </div>
    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#737373', fontFamily: 'Segoe UI, sans-serif' }}>Microsoft</span>
  </div>
);

const LenovoLogo = () => (
  <div className="partner-logo-content">
    <div style={{ background: '#E2231A', color: '#FFFFFF', padding: '3px 10px', fontWeight: 800, fontSize: '0.9rem', fontStyle: 'italic', borderRadius: '3px', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>
      Lenovo
    </div>
  </div>
);

const DellLogo = () => (
  <div className="partner-logo-content">
    <div style={{ border: '2.5px solid #0076CE', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0076CE', fontWeight: 900, fontSize: '0.74rem', fontFamily: 'sans-serif', letterSpacing: '-0.04em' }}>
      DELL
    </div>
  </div>
);

const TallyLogo = () => (
  <div className="partner-logo-content">
    <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 900, fontSize: '1.2rem', color: '#1E293B', letterSpacing: '-0.02em' }}>Tally</span>
  </div>
);

const ZohoLogo = () => (
  <div className="partner-logo-content">
    <div style={{ display: 'flex', gap: '2px', fontWeight: 900, fontSize: '0.8rem' }}>
      <span style={{ background: '#E42526', color: '#FFF', padding: '2px 5px', borderRadius: '3px' }}>Z</span>
      <span style={{ background: '#008744', color: '#FFF', padding: '2px 5px', borderRadius: '3px' }}>O</span>
      <span style={{ background: '#00579E', color: '#FFF', padding: '2px 5px', borderRadius: '3px' }}>H</span>
      <span style={{ background: '#F3B000', color: '#FFF', padding: '2px 5px', borderRadius: '3px' }}>O</span>
    </div>
  </div>
);

const AwsLogo = () => (
  <div className="partner-logo-content" style={{ flexDirection: 'column', gap: '1px' }}>
    <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#232F3E', letterSpacing: '-0.04em', lineHeight: 1 }}>aws</span>
    <svg width="22" height="5" viewBox="0 0 22 5" fill="none">
      <path d="M1 2C6 4.5 16 4.5 21 1" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 1L21.5 1.5L20 3" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const CtrlSLogo = () => (
  <div className="partner-logo-content">
    <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#00A651' }}>Ctrl</span>
    <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#1E293B' }}>S</span>
  </div>
);

const HpeLogo = () => (
  <div className="partner-logo-content" style={{ gap: '6px' }}>
    <div style={{ border: '3px solid #01A781', width: '20px', height: '11px', flexShrink: 0 }} />
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Hewlett Packard</span>
      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#01A781', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Enterprise</span>
    </div>
  </div>
);

const FortinetLogo = () => (
  <div className="partner-logo-content" style={{ gap: '4px' }}>
    <div style={{ width: '8px', height: '8px', background: '#C8102E', borderRadius: '1px' }} />
    <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '0.92rem', color: '#1E293B', letterSpacing: '0.04em' }}>FORTINET.</span>
  </div>
);

const PARTNER_LOGOS = [
  { id: 1, component: MicrosoftLogo, name: "Microsoft" },
  { id: 2, component: LenovoLogo, name: "Lenovo" },
  { id: 3, component: DellLogo, name: "Dell" },
  { id: 4, component: TallyLogo, name: "Tally" },
  { id: 5, component: ZohoLogo, name: "Zoho" },
  { id: 6, component: AwsLogo, name: "AWS" },
  { id: 7, component: CtrlSLogo, name: "CtrlS" },
  { id: 8, component: HpeLogo, name: "HPE" },
  { id: 9, component: FortinetLogo, name: "Fortinet" },
];

export default function TrustedPartnersSection() {
  return (
    <section className="nis-trusted-partners-section" aria-label="Our Trusted Technology Partners">
      <div className="container">
        <div className="trusted-partners-header-row">
          <div className="trusted-header-left">
            <div className="trusted-badge-pill">
              <Users size={14} />
              <span>OUR TRUSTED PARTNERS</span>
            </div>
            <p className="trusted-sub-text">
              We work with industry-leading brands to deliver the best solutions for you.
            </p>
          </div>

          <Link to="/contact" className="trusted-view-all-link">
            <span>View All Partners</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Horizontal White Logo Cards Bar / Infinite Ticker */}
        <div className="trusted-logos-scroll-wrapper">
          <div className="trusted-logos-scroll-track">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((p, idx) => {
              const LogoComp = p.component;
              return (
                <div key={`${p.id}-${idx}`} className="trusted-logo-white-card">
                  <LogoComp />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
