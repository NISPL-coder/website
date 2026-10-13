import React from 'react';

const AUTHORIZED_PARTNERS = [
  // 1. Lenovo
  {
    id: 'lenovo',
    name: 'Lenovo',
    render: () => (
      <div className="demo-big-logo-item demo-lenovo-partner">
        <div className="lenovo-red-badge" aria-hidden="true">
          <span className="lenovo-text">lenovo</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Authorized Partner</span>
        </div>
      </div>
    )
  },

  // 2. CtrlS
  {
    id: 'ctrls',
    name: 'CtrlS',
    render: () => (
      <div className="demo-big-logo-item demo-ctrls-partner">
        <div className="ctrls-text-logo">
          <span className="ctrl-part">Ctrl</span>
          <span className="s-part">S</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Datacenter Cloud</span>
        </div>
      </div>
    )
  },

  // 3. Hikvision
  {
    id: 'hikvision',
    name: 'Hikvision',
    render: () => (
      <div className="demo-big-logo-item demo-hikvision-partner">
        <div className="hikvision-logo-wrap">
          <span className="hik-part">HIK</span>
          <span className="vision-part">VISION</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Security Solutions</span>
        </div>
      </div>
    )
  },

  // 4. HP
  {
    id: 'hp',
    name: 'HP',
    render: () => (
      <div className="demo-big-logo-item demo-hp-partner">
        <div className="hp-circle-logo" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="#0096D6" />
            <g transform="skewX(-15) translate(14, 0)">
              <rect x="23" y="16" width="9.5" height="68" fill="#FFFFFF" rx="2" />
              <path d="M33 46C38 39 45 39 49 43C53 47 53 56 53 64V84H43V65C43 59 41 53 36 53C33 53 33 56 33 59V84H23" fill="#FFFFFF" />
              <rect x="58" y="38" width="9.5" height="54" fill="#FFFFFF" rx="2" />
              <path d="M68 47C73 40 80 40 84 44C89 49 89 58 89 65C89 72 88 80 83 85C79 89 71 89 68 83" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
        <div className="partner-name-stack">
          <span className="hp-title-text">HP</span>
          <span className="partner-sub-text">Enterprise Partner</span>
        </div>
      </div>
    )
  },

  // 5. CP Plus
  {
    id: 'cp-plus',
    name: 'CP Plus',
    render: () => (
      <div className="demo-big-logo-item demo-cpplus-partner">
        <div className="cpplus-badge-box" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#D71920" />
            <circle cx="12" cy="12" r="5.5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="cpplus-text-group">
          <span className="cpplus-main-title">CP PLUS</span>
          <span className="partner-sub-text">Security Systems</span>
        </div>
      </div>
    )
  },

  // 6. D-Link
  {
    id: 'd-link',
    name: 'D-Link',
    render: () => (
      <div className="demo-big-logo-item demo-dlink-partner">
        <div className="dlink-wordmark-wrap">
          <span className="dlink-text">D-Link</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Networking Partner</span>
        </div>
      </div>
    )
  },

  // 7. Tata Teleservice
  {
    id: 'tata-teleservice',
    name: 'Tata Teleservice',
    render: () => (
      <div className="demo-big-logo-item demo-tata-tele-partner">
        <div className="tata-tele-mark" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M12 6V20M8 12H16" stroke="#0052CC" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="partner-name-stack">
          <span className="tata-tele-title">TATA TELESERVICES</span>
          <span className="partner-sub-text">Business Services</span>
        </div>
      </div>
    )
  },

  // 8. Sangam CRM
  {
    id: 'sangam-crm',
    name: 'Sangam CRM',
    render: () => (
      <div className="demo-big-logo-item demo-sangam-partner">
        <div className="sangam-icon-mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F97316" />
            <path d="M2 17L12 22L22 17" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="partner-name-stack">
          <div className="sangam-text-line">
            <span className="sangam-main-word">Sangam</span>
            <span className="sangam-crm-badge">CRM</span>
          </div>
          <span className="partner-sub-text">Enterprise Solutions</span>
        </div>
      </div>
    )
  },

  // 9. Epson Printer
  {
    id: 'epson',
    name: 'Epson Printer',
    render: () => (
      <div className="demo-big-logo-item demo-epson-partner">
        <div className="epson-wordmark-wrap">
          <span className="epson-title">EPSON</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Print & Imaging</span>
        </div>
      </div>
    )
  },

  // 10. Canon
  {
    id: 'canon',
    name: 'Canon',
    render: () => (
      <div className="demo-big-logo-item demo-canon-partner">
        <div className="canon-wordmark-wrap">
          <span className="canon-title">Canon</span>
        </div>
        <div className="partner-name-stack">
          <span className="partner-sub-text">Optics & Printing</span>
        </div>
      </div>
    )
  }
];

export { AUTHORIZED_PARTNERS };
