import React from 'react';
import { LogOut, ShieldCheck, KeyRound, Server, UserCog } from 'lucide-react';
import { authApi } from '../../../services/authApi';
import './AdminTools.css';

export default function ProfilePage({ adminName, adminEmail, onSignOut }) {
  const sessionUser = authApi.getCurrentUser() || {};

  const name = sessionUser.name || adminName || 'NISPL Administrator';
  const email = sessionUser.email || adminEmail || 'admin@netinfotechsystem.in';
  const role = sessionUser.role || sessionUser.tier || 'Administrator';

  const infoItems = [
    { label: 'Portal Access', value: 'NISPL Admin Console', icon: ShieldCheck },
    { label: 'Role', value: role, icon: UserCog },
    { label: 'Sign-In Method', value: 'Email & Password', icon: KeyRound },
    { label: 'Primary NOC Node', value: 'CtrlS Kolkata Rated-4', icon: Server }
  ];

  return (
    <div className="adm-table-card animate-fade-in">
      <div className="adm-card-header">
        <div className="adm-card-header-info">
          <h1 className="adm-section-title">Admin Profile</h1>
          <p className="adm-section-sub">
            Your identity, access clearance and session details for the NISPL admin console.
          </p>
        </div>
      </div>

      <div className="adm-profile-hero" style={{ marginTop: '14px' }}>
        <span className="adm-profile-hero-avatar">
          {name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('')}
        </span>
        <div>
          <h2 className="adm-profile-hero-name">{name}</h2>
          <p className="adm-profile-hero-email">{email}</p>
          <span className="adm-status-pill active">
            <ShieldCheck size={12} />
            <span>Active Session</span>
          </span>
        </div>
      </div>

      <div className="adm-profile-info-grid" style={{ marginTop: '16px' }}>
        {infoItems.map((item) => (
          <div key={item.label} className="adm-profile-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <item.icon size={13} color="#6366f1" />
              <div className="adm-profile-info-label" style={{ marginBottom: 0 }}>{item.label}</div>
            </div>
            <div className="adm-profile-info-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="adm-signout-btn" onClick={onSignOut} title="Sign out of Admin Session">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
