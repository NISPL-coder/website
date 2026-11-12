import React from 'react';
import { useLocation } from 'react-router-dom';
import ctrlsLogo from '../../assets/partners/ctrls.png';
import './FixedFooter.css';

export default function FixedFooter() {
  const location = useLocation();
  const pathname = location.pathname || '';

  // Exclude footer completely from all types of login and registration pages
  const isLoginPage = [
    '/login',
    '/customer-login',
    '/customer_login',
    '/customer/login',
    '/reset-password',
    '/customer-register',
    '/customer_register'
  ].some((p) => pathname === p || pathname.startsWith(p));

  if (isLoginPage) {
    return null;
  }

  // Detect whether current view has a desktop navigation rail
  let sidebarType = '';
  if (pathname.startsWith('/admin')) {
    sidebarType = 'admin';
  } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/customer')) {
    sidebarType = 'customer';
  } else if (pathname.startsWith('/partner')) {
    sidebarType = 'partner';
  }

  return (
    <footer
      className={`nis-fixed-global-footer${sidebarType ? ` has-sidebar has-sidebar-${sidebarType}` : ''}`}
      role="contentinfo"
      aria-label="Global Fixed Footer"
    >
      <div className="nis-fixed-footer-container">
        <span className="nis-fixed-footer-text">
          <span className="nis-fixed-footer-creator">
            Net Infotech System Pvt. Ltd.
          </span>
          <span className="nis-fixed-footer-sep" aria-hidden="true">|</span>
          <span className="nis-fixed-footer-copowered">
            Co-powered by{' '}
            <a
              href="https://www.ctrls.com/datacenter-kolkata"
              target="_blank"
              rel="noopener noreferrer"
              className="nis-fixed-footer-ctrls-link"
              title="CtrlS Datacenter Kolkata (opens in new tab)"
              aria-label="CtrlS Datacenter Kolkata"
            >
              <img 
                src={ctrlsLogo} 
                alt="CtrlS" 
                className="nis-fixed-footer-ctrls-logo" 
                height="15"
              />
            </a>
          </span>
        </span>
      </div>
    </footer>
  );
}
