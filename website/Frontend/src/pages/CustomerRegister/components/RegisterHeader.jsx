import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logoImg from '../../../assets/NISPL Cloud Tech Logo Black.png';

export default function RegisterHeader() {
  return (
    <header className="ebolt-top-nav">
      <Link to="/" className="ebolt-brand-link" title="Net Infotech System Pvt. Ltd. Concept to Reality">
        <img 
          src={logoImg} 
          alt="Net Infotech System Pvt. Ltd." 
          className="ebolt-brand-logo-img" 
          height="48"
        />
      </Link>

      <Link to="/customer-login" className="ebolt-home-pill-btn" id="reg-back-to-login">
        <ArrowLeft size={14} />
        <span>Back to Login</span>
      </Link>
    </header>
  );
}
