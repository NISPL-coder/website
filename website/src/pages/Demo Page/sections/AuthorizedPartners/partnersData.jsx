import React from 'react';

// Partner Logos from src/assets/partners
import ctrlsLogo from '../../../../assets/partners/ctrls.png';
import tallyLogo from '../../../../assets/partners/tally.png';
import hpLogo from '../../../../assets/partners/HP.png';
import lenovoLogo from '../../../../assets/partners/lenovo.png';
import tataTeleLogo from '../../../../assets/partners/tata teleservice.png';
import epsonLogo from '../../../../assets/partners/Epson.png';
import hikvisionLogo from '../../../../assets/partners/Hik vision.png';
import dlinkLogo from '../../../../assets/partners/D link.png';
import canonLogo from '../../../../assets/partners/canon.png';

const AUTHORIZED_PARTNERS = [
  // 1. CTRLS
  {
    id: 'ctrls',
    name: 'CTRLS',
    logo: ctrlsLogo,
    website: 'https://www.ctrls.com/',
    render: () => (
      <a 
        href="https://www.ctrls.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-ctrls-partner" 
        title="CTRLS - Official Website"
      >
        <img src={ctrlsLogo} alt="CTRLS" className="partner-brand-img" />
      </a>
    )
  },

  // 2. Tally
  {
    id: 'tally',
    name: 'Tally',
    logo: tallyLogo,
    website: 'https://tallysolutions.com/',
    render: () => (
      <a 
        href="https://tallysolutions.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-tally-partner" 
        title="Tally - Official Website"
      >
        <img src={tallyLogo} alt="Tally" className="partner-brand-img" />
      </a>
    )
  },

  // 3. HP
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
        <img src={hpLogo} alt="HP" className="partner-brand-img" />
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
        <img src={lenovoLogo} alt="Lenovo" className="partner-brand-img" />
      </a>
    )
  },

  // 5. Tata tele service
  {
    id: 'tata-tele-service',
    name: 'Tata tele service',
    logo: tataTeleLogo,
    website: 'https://www.tatatelebusiness.com/',
    render: () => (
      <a 
        href="https://www.tatatelebusiness.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-big-logo-item demo-tata-tele-partner" 
        title="Tata Tele Business Services - Official Website"
      >
        <img src={tataTeleLogo} alt="Tata tele service" className="partner-brand-img partner-tata-img" />
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
        <img src={epsonLogo} alt="Epson" className="partner-brand-img" />
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
        <img src={hikvisionLogo} alt="Hik vision" className="partner-brand-img" />
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
        <img src={dlinkLogo} alt="D link" className="partner-brand-img" />
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
        <img src={canonLogo} alt="Canon" className="partner-brand-img" />
      </a>
    )
  }
];

export { AUTHORIZED_PARTNERS };
