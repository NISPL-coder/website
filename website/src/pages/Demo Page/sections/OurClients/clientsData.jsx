import React from 'react';
import sfdcLogo from '../../../../assets/SFDC_logo.png';
import teaBoardLogo from '../../../../assets/tea_board_logo.png';

const CLIENT_SHOWCASE_LOGOS = [
  {
    id: 'tata-steel',
    name: 'Tata Steel',
    render: () => (
      <div className="demo-big-client-item">
        <div className="tata-logo-mark" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M12 6V20M8 12H16" stroke="#0052CC" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="client-text-name tata-blue">TATA STEEL</span>
      </div>
    )
  },
  {
    id: 'lt',
    name: 'Larsen & Toubro',
    render: () => (
      <div className="demo-big-client-item">
        <div className="lt-circle-emblem" aria-hidden="true">L&T</div>
        <span className="client-text-name lt-blue">LARSEN & TOUBRO</span>
      </div>
    )
  },
  {
    id: 'itc',
    name: 'ITC Limited',
    render: () => (
      <div className="demo-big-client-item">
        <div className="itc-triangle-mark" aria-hidden="true">
          <span>ITC</span>
        </div>
        <span className="client-text-name itc-maroon">ITC Limited</span>
      </div>
    )
  },
  {
    id: 'sfdc',
    name: 'Govt. of West Bengal (SFDC)',
    render: () => (
      <div className="demo-big-client-item">
        <img src={sfdcLogo} alt="Govt. of West Bengal SFDC" className="client-brand-img" />
        <span className="client-text-name sfdc-blue">Govt. of West Bengal (SFDC)</span>
      </div>
    )
  },
  {
    id: 'tea-board',
    name: 'Tea Board of India',
    render: () => (
      <div className="demo-big-client-item">
        <img src={teaBoardLogo} alt="Tea Board of India" className="client-brand-img" />
        <span className="client-text-name teaboard-green">Tea Board of India</span>
      </div>
    )
  },
  {
    id: 'reliance',
    name: 'Reliance Industries',
    render: () => (
      <div className="demo-big-client-item">
        <div className="reliance-emblem" aria-hidden="true">
          <div className="reliance-inner-crest" />
        </div>
        <span className="client-text-name reliance-blue">Reliance Industries</span>
      </div>
    )
  },
  {
    id: 'emami',
    name: 'Emami Group',
    render: () => (
      <div className="demo-big-client-item">
        <span className="client-wordmark emami-red">emami</span>
      </div>
    )
  },
  {
    id: 'exide',
    name: 'Exide Industries',
    render: () => (
      <div className="demo-big-client-item">
        <span className="client-wordmark exide-red">EXIDE</span>
      </div>
    )
  }
];

export { CLIENT_SHOWCASE_LOGOS };
