import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../../services/authApi';
import { getProfileCompletion } from '../../../utils/profileCompletion';
import ProfileCompletionCircle from '../../../components/common/ProfileCompletionCircle';
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

const ROLE_LABELS = {
  admin: 'Primary Admin',
  manager: 'Manager',
  support: 'Support',
  partner: 'Partner',
  customer: 'Customer'
};

/** The signed-in account's role, straight from the live session — never assumed. */
function roleLabel(role, isPrimaryAdmin) {
  const key = String(role).trim().toLowerCase();
  if (key === 'admin' || key === 'primary admin' || key === 'primaryadmin' || isPrimaryAdmin) return 'Primary Admin';
  return ROLE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function roleToneClass(role) {
  const key = String(role).trim().toLowerCase();
  if (key === 'admin' || key === 'primary admin' || key === 'primaryadmin') return 'adm-profile-role--admin';
  return ROLE_LABELS[key] ? `adm-profile-role--${key}` : '';
}

function RoleBadge({ role, isPrimaryAdmin }) {
  if (!role) return null;
  return (
    <span className={`adm-profile-role ${roleToneClass(role)}`} title={`Account role: ${roleLabel(role, isPrimaryAdmin)}`}>
      {roleLabel(role, isPrimaryAdmin)}
    </span>
  );
}

export default function AdminProfileMenu({
  name,
  email,
  role,
  isPrimaryAdmin = false,
  profilePath = '/admin/profile',
  onSignOut,
  user = null
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const effectiveUser = user || authApi.getCurrentUser() || { name, email, role };
  const completion = getProfileCompletion(effectiveUser);

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
        title={`Profile ${completion.percentage}% completed — click to manage`}
      >
        {/* Avatar with Small Circular Progress Ring Badge */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
          <span className="adm-profile-avatar">{getInitials(name)}</span>
          <div
            className="adm-profile-circle-badge"
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-5px',
              background: '#ffffff',
              borderRadius: '999px',
              padding: '1px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
            title={`Profile is ${completion.percentage}% completed`}
          >
            <ProfileCompletionCircle
              percentage={completion.percentage}
              size={21}
              strokeWidth={2.4}
              showPercentageInside={false}
            />
            <span
              style={{
                position: 'absolute',
                fontSize: '0.50rem',
                fontWeight: 800,
                color:
                  completion.percentage === 100
                    ? '#059669'
                    : completion.percentage >= 60
                    ? '#4f46e5'
                    : '#d97706',
                lineHeight: 1
              }}
            >
              {completion.percentage}%
            </span>
          </div>
        </div>

        <span className="adm-profile-meta">
          <span className="adm-profile-name">{name}</span>
          {email && <span className="adm-profile-email">{email}</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <RoleBadge role={role} isPrimaryAdmin={isPrimaryAdmin} />
          </div>
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
              <span className="adm-profile-dropdown-role">
                <RoleBadge role={role} isPrimaryAdmin={isPrimaryAdmin} />
              </span>
            </span>
          </div>

          {/* Profile Completion Overview Card */}
          <div
            style={{
              margin: '8px 12px 10px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <ProfileCompletionCircle
              percentage={completion.percentage}
              size={40}
              strokeWidth={3.5}
              showPercentageInside={true}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  Profile Completion
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color:
                      completion.percentage === 100
                        ? '#059669'
                        : completion.percentage >= 60
                        ? '#4f46e5'
                        : '#d97706'
                  }}
                >
                  {completion.percentage}%
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.68rem',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                {completion.percentage === 100
                  ? 'All details verified & completed'
                  : `${completion.completedCount} of ${completion.totalCount} details verified`}
              </p>
              {completion.percentage < 100 && profilePath && (
                <button
                  type="button"
                  onClick={() => handleNavigate(profilePath)}
                  style={{
                    marginTop: '5px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span>Complete your profile</span>
                  <span>&rarr;</span>
                </button>
              )}
            </div>
          </div>

          {profilePath && (
            <button
              type="button"
              className="adm-profile-dropdown-item"
              onClick={() => handleNavigate(profilePath)}
              role="menuitem"
            >
              <User size={15} />
              <span>Profile</span>
            </button>
          )}

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
