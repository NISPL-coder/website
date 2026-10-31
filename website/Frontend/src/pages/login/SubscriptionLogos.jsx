import React from 'react';
import tallyImg from '../../assets/partners/tally.png';

/**
 * Authentic, prominent brand logos for the NISPL subscription catalog:
 * 1. Tally Software Service (TSS) Single User (Silver)
 * 2. Tally Software Service (TSS) Multi User (Gold)
 * 3. Tally Software Service (TSS) Auditors (CA Edition)
 * 4. Tally on Mobile — Biz Analyst (Official Mobile Analytics App)
 * 5. Tally from WhatsApp (Official WhatsApp Cloud API)
 * 6. TallyPrime (Official TallyPrime ERP Suite)
 * 7. Single User to Multi User Upgrade (Silver -> Gold License Upgrade)
 */

export function TallySingleLogo() {
  return (
    <div className="cust-brand-logo-box tally-single-box" title="Tally Software Service — Single User (Silver)">
      <img src={tallyImg} alt="Tally" className="cust-tally-img" />
      <span className="cust-logo-sub-tag silver-tag">Silver</span>
    </div>
  );
}

export function TallyMultiLogo() {
  return (
    <div className="cust-brand-logo-box tally-multi-box" title="Tally Software Service — Multi User (Gold)">
      <img src={tallyImg} alt="Tally" className="cust-tally-img" />
      <span className="cust-logo-sub-tag gold-tag">Gold</span>
    </div>
  );
}

export function TallyAuditorLogo() {
  return (
    <div className="cust-brand-logo-box tally-auditor-box" title="Tally Software Service — Auditors Edition">
      <img src={tallyImg} alt="Tally" className="cust-tally-img" />
      <span className="cust-logo-sub-tag auditor-tag">Auditor</span>
    </div>
  );
}

export function BizAnalystLogo() {
  return (
    <div className="cust-brand-logo-box biz-analyst-box" title="Tally on Mobile — Biz Analyst Official App">
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bizBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="bar1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="bar2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bar3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Rounded App Icon Base */}
        <rect width="48" height="48" rx="12" fill="url(#bizBg)" />
        {/* Smartphone Screen Outline */}
        <rect x="9" y="7" width="30" height="34" rx="5" fill="#FFFFFF" fillOpacity="0.15" stroke="#FFFFFF" strokeWidth="1.5" />
        <rect x="20" y="9" width="8" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.8" />
        {/* Analytics Growth Chart Bars */}
        <rect x="14" y="24" width="4.5" height="11" rx="1.5" fill="url(#bar1)" />
        <rect x="21.5" y="19" width="4.5" height="16" rx="1.5" fill="url(#bar2)" />
        <rect x="29" y="14" width="4.5" height="21" rx="1.5" fill="url(#bar3)" />
        {/* Trendline Arrow */}
        <path d="M14 22L22 16L29 11L33 13" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 11H34V15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="cust-logo-sub-tag biz-tag">Mobile</span>
    </div>
  );
}

export function WhatsAppLogo() {
  return (
    <div className="cust-brand-logo-box whatsapp-box" title="Official WhatsApp Cloud API">
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#128C7E" />
          </linearGradient>
        </defs>
        {/* WhatsApp Green Circular Icon */}
        <circle cx="24" cy="24" r="22" fill="url(#waBg)" />
        {/* Speech Bubble Base */}
        <path
          d="M24 10C16.27 10 10 16.27 10 24C10 26.85 10.87 29.5 12.37 31.71L11 37L16.48 35.65C18.66 37.03 21.24 37.83 24 37.83C31.73 37.83 38 31.56 38 23.83C38 16.1 31.73 10 24 10Z"
          fill="#FFFFFF"
        />
        {/* Telephone Handset in WhatsApp Green */}
        <path
          d="M31.2 28.1C30.8 27 29.1 26.2 28.3 25.8C27.5 25.4 26.9 25.2 26.3 26.1C25.7 27 25.1 27.8 24.6 28.3C24.1 28.8 23.6 28.9 22.8 28.5C22 28.1 19.4 27.2 16.3 24.4C13.9 22.2 13.8 21.3 13.4 20.5C13 19.7 13.4 19.3 13.8 18.9C14.1 18.6 14.6 18 15.1 17.5C15.6 17 15.8 16.6 16.1 16C16.4 15.4 16.3 14.9 16.1 14.5C15.9 14.1 14.1 9.8 13.4 8C12.7 6.2 12 6.5 11.5 6.5C11 6.5 10.4 6.5 9.8 6.5C9.2 6.5 8.3 6.7 7.5 7.6C6.7 8.5 4.5 10.6 4.5 14.8C4.5 19 7.6 23 8 23.6C8.4 24.2 14.1 33 22.9 36.8C31.7 40.6 31.7 39.4 33.3 39.2C34.9 39 38.5 37 39.3 34.8C40.1 32.6 40.1 30.7 39.8 30.3C39.5 29.9 38.9 29.7 38.1 29.3C37.3 28.9 31.6 29.2 31.2 28.1Z"
          fill="#25D366"
          transform="translate(4, 3) scale(0.72)"
        />
      </svg>
      <span className="cust-logo-sub-tag wa-tag">WhatsApp</span>
    </div>
  );
}

export function TallyPrimeLogo() {
  return (
    <div className="cust-brand-logo-box tallyprime-box" title="Official TallyPrime ERP">
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tpBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B192C" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="tpGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="tpRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="tpCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* TallyPrime Deep Navy Base */}
        <rect width="48" height="48" rx="12" fill="url(#tpBg)" />
        {/* Signature TallyPrime Geometric Marks */}
        <path d="M12 14C12 11.79 13.79 10 16 10H24V22H16C13.79 22 12 20.21 12 18V14Z" fill="url(#tpGold)" />
        <path d="M26 10H32C34.21 10 36 11.79 36 14V18C36 20.21 34.21 22 32 22H26V10Z" fill="url(#tpRed)" />
        <path d="M12 26H24V38H16C13.79 38 12 36.21 12 34V26Z" fill="url(#tpCyan)" />
        <path d="M26 26H36V34C36 36.21 34.21 38 32 38H26V26Z" fill="#FFFFFF" fillOpacity="0.9" />
        {/* Center "T" Monogram Accent */}
        <text x="24" y="27" textAnchor="middle" fill="#0B192C" fontSize="11" fontWeight="900" fontFamily="sans-serif">T</text>
      </svg>
      <span className="cust-logo-sub-tag tp-tag">Prime</span>
    </div>
  );
}

export function TallyUpgradeLogo() {
  return (
    <div className="cust-brand-logo-box tally-upgrade-box" title="Single User to Multi User Upgrade">
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="upgBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
        {/* Clean Light Background */}
        <rect width="48" height="48" rx="12" fill="url(#upgBg)" stroke="#CBD5E1" strokeWidth="1" />
        {/* Silver Disk */}
        <circle cx="16" cy="30" r="10" fill="#94A3B8" />
        <text x="16" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">1P</text>
        {/* Gold Multi-User Disk */}
        <circle cx="32" cy="18" r="12" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <text x="32" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">LAN</text>
        {/* Vibrant Rising Upgrade Arrow */}
        <path d="M20 26L28 18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 17H29V24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="cust-logo-sub-tag upg-tag">Upgrade</span>
    </div>
  );
}
