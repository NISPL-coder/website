import React from 'react';

// Partner Logos from src/assets/partners (Optimized WebP)
import ctrlsLogo from '../../../../assets/partners/ctrls.webp';
import tallyLogo from '../../../../assets/partners/tally.webp';
import hpLogo from '../../../../assets/partners/HP.webp';
import lenovoLogo from '../../../../assets/partners/lenovo.webp';
import tataTeleLogo from '../../../../assets/partners/tata teleservice.webp';
import epsonLogo from '../../../../assets/partners/Epson.webp';
import hikvisionLogo from '../../../../assets/partners/Hik vision.webp';
import dlinkLogo from '../../../../assets/partners/D link.webp';
import canonLogo from '../../../../assets/partners/canon.webp';

// ── Direct Partners (Tier-1 Cloud Infrastructure & Business ERP) ──
const DIRECT_PARTNERS = [
  // 1. CTRLS
  {
    id: 'ctrls',
    name: 'CTRLS',
    category: 'Direct Partner',
    logo: ctrlsLogo,
    website: 'https://www.ctrls.com/datacenter-kolkata/',
    render: () => (
      <a 
        href="https://www.ctrls.com/datacenter-kolkata/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-ctrls-partner" 
        title="CTRLS - Official Website (Direct Partner)"
      >
        <img 
          src={ctrlsLogo} 
          alt="CTRLS - Direct Partner" 
          className="partner-brand-img" 
          width="120"
          height="32"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 2. Tally
  {
    id: 'tally',
    name: 'Tally',
    category: 'Direct Partner',
    logo: tallyLogo,
    website: 'https://tallysolutions.com/',
    render: () => (
      <a 
        href="https://tallysolutions.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-tally-partner" 
        title="Tally - Official Website (Direct Partner)"
      >
        <img 
          src={tallyLogo} 
          alt="Tally - Direct Partner" 
          className="partner-brand-img" 
          width="110"
          height="45"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  }
];

// ── Authorized Partners (Enterprise Hardware, Computing & Imaging) ──
const AUTHORIZED_PARTNERS = [
  // 1. HP
  {
    id: 'hp',
    name: 'HP',
    logo: hpLogo,
    website: 'https://www.hp.com/in-en/',
    render: () => (
      <a 
        href="https://www.hp.com/in-en/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-hp-partner" 
        title="HP - Official Website"
      >
        <img 
          src={hpLogo} 
          alt="HP" 
          className="partner-brand-img" 
          width="50"
          height="50"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 4. Lenovo
  {
    id: 'lenovo',
    name: 'Lenovo',
    logo: lenovoLogo,
    website: 'https://www.lenovo.com/in/en/',
    render: () => (
      <a 
        href="https://www.lenovo.com/in/en/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-lenovo-partner" 
        title="Lenovo - Official Website"
      >
        <img 
          src={lenovoLogo} 
          alt="Lenovo" 
          className="partner-brand-img" 
          width="120"
          height="40"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 5. Tata tele service
  {
    id: 'tata',
    name: 'Tata',
    logo: tataTeleLogo,
    website: 'https://www.tata.com/',
    render: () => (
      <a 
        href="https://www.tata.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-tata-tele-partner" 
        title="Tata Tele Business Services - Official Website"
      >
        <img 
          src={tataTeleLogo} 
          alt="Tata tele service" 
          className="partner-brand-img partner-tata-img" 
          width="80"
          height="50"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 6. Epson
  {
    id: 'epson',
    name: 'Epson',
    logo: epsonLogo,
    website: 'https://www.epson.co.in/',
    render: () => (
      <a 
        href="https://www.epson.co.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-epson-partner" 
        title="Epson - Official Website"
      >
        <img 
          src={epsonLogo} 
          alt="Epson" 
          className="partner-brand-img" 
          width="110"
          height="38"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 7. Hik vision
  {
    id: 'hikvision',
    name: 'Hik vision',
    logo: hikvisionLogo,
    website: 'https://www.hikvision.com/',
    render: () => (
      <a 
        href="https://www.hikvision.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-hikvision-partner" 
        title="Hikvision - Official Website"
      >
        <img 
          src={hikvisionLogo} 
          alt="Hik vision" 
          className="partner-brand-img" 
          width="120"
          height="32"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 8. D link
  {
    id: 'd-link',
    name: 'D link',
    logo: dlinkLogo,
    website: 'https://www.dlink.com/in/en',
    render: () => (
      <a 
        href="https://www.dlink.com/in/en" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-dlink-partner" 
        title="D-Link - Official Website"
      >
        <img 
          src={dlinkLogo} 
          alt="D link" 
          className="partner-brand-img" 
          width="110"
          height="40"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  },

  // 9. Canon
  {
    id: 'canon',
    name: 'Canon',
    logo: canonLogo,
    website: 'https://in.canon/',
    render: () => (
      <a 
        href="https://in.canon/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-canon-partner" 
        title="Canon - Official Website"
      >
        <img 
          src={canonLogo} 
          alt="Canon" 
          className="partner-brand-img" 
          width="110"
          height="40"
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  }
];

export { DIRECT_PARTNERS, AUTHORIZED_PARTNERS };
