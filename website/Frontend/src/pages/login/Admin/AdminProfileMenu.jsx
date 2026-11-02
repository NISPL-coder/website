import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import './AdminTools.css';

function getInitials(name) {
  if (!name) return 'A';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function AdminProfileMenu({ name, email, onSignOut }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="adm-profile-menu" ref={wrapRef}>
      <button
        type="button"
        className={`adm-profile-chip ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Account profile & session"
      >
        <span className="adm-profile-avatar">{getInitials(name)}</span>
        <span className="adm-profile-meta">
          <span className="adm-profile-name">{name}</span>
          <span className="adm-profile-email">{email}</span>
        </span>
        <ChevronDown size={14} className={`adm-profile-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="adm-profile-dropdown" role="menu">
          <div className="adm-profile-dropdown-header">
            <span className="adm-profile-avatar">{getInitials(name)}</span>
            <span className="adm-profile-meta">
              <span className="adm-profile-name">{name}</span>
              <span className="adm-profile-email">{email}</span>
            </span>
          </div>

          <button
            type="button"
            className="adm-profile-dropdown-item"
            onClick={() => handleNavigate('/admin/profile')}
            role="menuitem"
          >
            <User size={15} />
            <span>Profile</span>
          </button>

          <div className="adm-profile-dropdown-divider" />

          <button
            type="button"
            className="adm-profile-dropdown-item danger"
            onClick={onSignOut}
            role="menuitem"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
