import React from 'react';

const AUTHORIZED_PARTNERS = [
  {
    id: 'google',
    name: 'Google Partner',
    render: () => (
      <div className="demo-big-logo-item demo-google-partner">
        <div className="google-bar-mark" aria-hidden="true" />
        <div className="google-partner-stack">
          <span className="google-word">Google</span>
          <span className="partner-word">Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'aws',
    name: 'AWS Partner Network',
    render: () => (
      <div className="demo-big-logo-item demo-aws-partner">
        <div className="aws-brand-block">
          <span className="aws-text">aws</span>
          <svg width="40" height="9" viewBox="0 0 38 9" fill="none" className="aws-smile-svg" aria-hidden="true">
            <path d="M1 3.5C9 7.5 28 7.5 36 2" stroke="#FF9900" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M33 2L37 3L35 6" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="aws-sub-text">
          <span>partner</span>
          <span>network</span>
        </div>
      </div>
    )
  },
  {
    id: 'adobe',
    name: 'Adobe Solution Partner',
    render: () => (
      <div className="demo-big-logo-item demo-adobe-partner">
        <svg width="32" height="28" viewBox="0 0 30 26" fill="none" className="adobe-svg" aria-hidden="true">
          <path d="M19 0H30V26L19 0Z" fill="#FA0F00" />
          <path d="M11 0H0V26L11 0Z" fill="#FA0F00" />
          <path d="M15 9.5L20.8 24H16.8L15 19H12.5L15 9.5Z" fill="#FA0F00" />
        </svg>
        <div className="adobe-sub-text">
          <span className="adobe-name">Adobe</span>
          <span className="adobe-partner-tag">SOLUTION PARTNER</span>
        </div>
      </div>
    )
  },
  {
    id: 'linode',
    name: 'Linode',
    render: () => (
      <div className="demo-big-logo-item demo-linode-partner">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="linode-svg" aria-hidden="true">
          <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#00B0FF" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(0, 176, 255, 0.12)" />
          <circle cx="12" cy="12" r="3.2" fill="#00B0FF" />
        </svg>
        <span className="linode-name">linode</span>
      </div>
    )
  },
  {
    id: 'microsoft',
    name: 'Microsoft Solutions Partner',
    render: () => (
      <div className="demo-big-logo-item demo-ms-partner">
        <div className="ms-quad-squares" aria-hidden="true">
          <div style={{ background: '#F25022' }} />
          <div style={{ background: '#7FBA00' }} />
          <div style={{ background: '#00A4EF' }} />
          <div style={{ background: '#FFB900' }} />
        </div>
        <div className="partner-name-stack">
          <span className="partner-main-text">Microsoft</span>
          <span className="partner-sub-text">Solutions Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'tally',
    name: 'Tally Certified 3-Star Partner',
    render: () => (
      <div className="demo-big-logo-item demo-tally-partner">
        <span className="tally-brand-title">Tally</span>
        <div className="partner-name-stack">
          <span className="tally-stars">★★★</span>
          <span className="partner-sub-text">Certified Partner</span>
        </div>
      </div>
    )
  },
  {
    id: 'ctrls',
    name: 'CtrlS Datacenter Partner',
    render: () => (
      <div className="demo-big-logo-item demo-ctrls-partner">
        <div className="ctrls-text-logo">
          <span className="ctrl-part">Ctrl</span>
          <span className="s-part">S</span>
        </div>
        <span className="partner-sub-text">Datacenter Cloud</span>
      </div>
    )
  },
  {
    id: 'dell',
    name: 'Dell Technologies',
    render: () => (
      <div className="demo-big-logo-item demo-dell-partner">
        <div className="dell-circle-emblem">DELL</div>
        <span className="partner-sub-text">Technologies</span>
      </div>
    )
  }
];

export { AUTHORIZED_PARTNERS };
