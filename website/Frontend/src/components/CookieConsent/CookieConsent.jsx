import React, { useState, useEffect } from 'react';
import { Cookie, MapPin, Shield, SlidersHorizontal, X, Check, Info } from 'lucide-react';
import './CookieConsent.css';

const COOKIE_STORAGE_KEY = 'nispl_cookie_consent_v3';
const LOCATION_STORAGE_KEY = 'nispl_user_location';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const [preferences, setPreferences] = useState({
    necessary: true,
    location: true,
    analytics: true,
    marketing: false
  });

  const [locationNotice, setLocationNotice] = useState('');

  // Request browser location if permitted
  const collectLocationData = () => {
    if (!('geolocation' in navigator)) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    setLocationNotice('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationPayload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString()
        };

        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationPayload));
        } catch (e) {
          console.warn('Could not store location data in localStorage:', e);
        }
        setLocationNotice('Location saved successfully.');
        setTimeout(() => setLocationNotice(''), 3000);
      },
      (error) => {
        console.log('Location permission not granted:', error.message);
        setLocationNotice('');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    // Check if user has previously given consent
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({
          ...prev,
          ...parsed
        }));
        setHasConsented(true);
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } catch (e) {
      setIsVisible(true);
    }
  }, []);

  // Listen for custom trigger to reopen cookie preferences anytime (e.g., from footer)
  useEffect(() => {
    const handleOpenModal = () => {
      setIsVisible(true);
      setShowCustomize(false);
    };

    window.addEventListener('open-cookie-settings', handleOpenModal);
    return () => window.removeEventListener('open-cookie-settings', handleOpenModal);
  }, []);

  // 1. Accept All
  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      location: true,
      analytics: true,
      marketing: true,
      consentedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn(e);
    }

    setPreferences(consentData);
    setHasConsented(true);
    setIsVisible(false);
    setShowCustomize(false);

    // Request location upon Accept All
    collectLocationData();
  };

  // 2. Deny All (Except strictly necessary)
  const handleDenyAll = () => {
    const consentData = {
      necessary: true,
      location: false,
      analytics: false,
      marketing: false,
      consentedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }

    setPreferences(consentData);
    setHasConsented(true);
    setIsVisible(false);
    setShowCustomize(false);
  };

  // 3. Save Custom Preferences
  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      necessary: true,
      consentedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn(e);
    }

    setHasConsented(true);
    setIsVisible(false);
    setShowCustomize(false);

    if (consentData.location) {
      collectLocationData();
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot disable strictly necessary
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      {/* 1. Floating Banner on Highlighted Section */}
      {isVisible && !showCustomize && (
        <aside 
          className="nis-cookie-banner" 
          role="region" 
          aria-label="Cookie and Privacy Consent Banner"
        >
          <div className="nis-cookie-banner-inner">
            <div className="nis-cookie-banner-content">
              <div className="nis-cookie-icon-wrapper" aria-hidden="true">
                <Cookie size={24} strokeWidth={1.8} className="nis-cookie-icon" />
              </div>
              <div className="nis-cookie-text">
                <div className="nis-cookie-title-row">
                  <h3 className="nis-cookie-title">We use cookies</h3>
                  <p className="nis-cookie-desc">
                    to give you a better experience and collect necessary &amp; location data.{' '}
                    <button 
                      type="button" 
                      onClick={() => setShowCustomize(true)} 
                      className="nis-cookie-inline-link"
                    >
                      our policies
                    </button>.
                  </p>
                </div>
                {locationNotice && <span className="nis-cookie-loc-status">{locationNotice}</span>}
              </div>
            </div>

            <div className="nis-cookie-banner-actions">
              <button 
                type="button" 
                onClick={handleAcceptAll} 
                className="nis-cookie-btn nis-cookie-btn-primary"
              >
                Accept
              </button>
              <button 
                type="button" 
                onClick={handleDenyAll} 
                className="nis-cookie-btn nis-cookie-btn-deny"
              >
                Deny
              </button>
              <button 
                type="button" 
                onClick={() => setShowCustomize(true)} 
                className="nis-cookie-btn nis-cookie-btn-secondary"
              >
                <SlidersHorizontal size={12} /> Customize
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Customization Modal */}
      {showCustomize && (
        <div className="nis-cookie-modal-backdrop" onClick={() => setShowCustomize(false)}>
          <div 
            className="nis-cookie-modal" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="cookie-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nis-cookie-modal-header">
              <div className="nis-cookie-modal-header-title">
                <div className="nis-cookie-modal-icon-badge">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 id="cookie-modal-title">Cookie & Data Collection Preferences</h3>
                  <p className="nis-cookie-modal-sub">
                    Choose which categories of cookies and data you allow us to collect.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="nis-cookie-modal-close" 
                onClick={() => setShowCustomize(false)}
                aria-label="Close preferences modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="nis-cookie-modal-body">
              {/* Category 1: Strictly Necessary */}
              <div className="nis-cookie-item">
                <div className="nis-cookie-item-info">
                  <div className="nis-cookie-item-title-row">
                    <span className="nis-cookie-item-name">Necessary Data & Security</span>
                    <span className="nis-cookie-badge-locked">Always Active</span>
                  </div>
                  <p className="nis-cookie-item-desc">
                    Required for core website security, encrypted SSL communications, inquiry form routing, and session integrity. Cannot be disabled.
                  </p>
                </div>
                <div className="nis-cookie-switch-wrapper">
                  <input 
                    type="checkbox" 
                    id="cookie-necessary" 
                    checked={true} 
                    disabled 
                    className="nis-cookie-switch" 
                  />
                  <label htmlFor="cookie-necessary" className="nis-cookie-switch-label disabled">
                    <span className="nis-cookie-switch-thumb" />
                  </label>
                </div>
              </div>

              {/* Category 2: Location Data */}
              <div className="nis-cookie-item">
                <div className="nis-cookie-item-info">
                  <div className="nis-cookie-item-title-row">
                    <span className="nis-cookie-item-name">
                      <MapPin size={16} className="nis-inline-icon" /> Location & Regional Routing
                    </span>
                    <span className="nis-cookie-badge-recommended">Recommended</span>
                  </div>
                  <p className="nis-cookie-item-desc">
                    Allows us to request your browser location to route service tickets and hardware requests to the nearest Net Infotech branch (Kolkata, Burdwan, Durgapur, etc.) and calculate rapid on-site response times.
                  </p>
                </div>
                <div className="nis-cookie-switch-wrapper">
                  <input 
                    type="checkbox" 
                    id="cookie-location" 
                    checked={preferences.location} 
                    onChange={() => togglePreference('location')} 
                    className="nis-cookie-switch" 
                  />
                  <label htmlFor="cookie-location" className="nis-cookie-switch-label">
                    <span className="nis-cookie-switch-thumb" />
                  </label>
                </div>
              </div>

              {/* Category 3: Analytics & Performance */}
              <div className="nis-cookie-item">
                <div className="nis-cookie-item-info">
                  <div className="nis-cookie-item-title-row">
                    <span className="nis-cookie-item-name">Analytics & Performance</span>
                  </div>
                  <p className="nis-cookie-item-desc">
                    Gathers anonymous operational metrics to monitor server latency, optimize media delivery, and enhance user experience.
                  </p>
                </div>
                <div className="nis-cookie-switch-wrapper">
                  <input 
                    type="checkbox" 
                    id="cookie-analytics" 
                    checked={preferences.analytics} 
                    onChange={() => togglePreference('analytics')} 
                    className="nis-cookie-switch" 
                  />
                  <label htmlFor="cookie-analytics" className="nis-cookie-switch-label">
                    <span className="nis-cookie-switch-thumb" />
                  </label>
                </div>
              </div>

              {/* Category 4: Personalized Experience */}
              <div className="nis-cookie-item">
                <div className="nis-cookie-item-info">
                  <div className="nis-cookie-item-title-row">
                    <span className="nis-cookie-item-name">Personalized Preferences</span>
                  </div>
                  <p className="nis-cookie-item-desc">
                    Remembers your business sector interests and previously viewed enterprise solutions for tailored content on future visits.
                  </p>
                </div>
                <div className="nis-cookie-switch-wrapper">
                  <input 
                    type="checkbox" 
                    id="cookie-marketing" 
                    checked={preferences.marketing} 
                    onChange={() => togglePreference('marketing')} 
                    className="nis-cookie-switch" 
                  />
                  <label htmlFor="cookie-marketing" className="nis-cookie-switch-label">
                    <span className="nis-cookie-switch-thumb" />
                  </label>
                </div>
              </div>
            </div>

            <div className="nis-cookie-modal-footer">
              <button 
                type="button" 
                onClick={handleDenyAll} 
                className="nis-cookie-btn nis-cookie-btn-deny"
              >
                Reject Non-Essential
              </button>
              <div className="nis-cookie-modal-footer-right">
                <button 
                  type="button" 
                  onClick={handleSavePreferences} 
                  className="nis-cookie-btn nis-cookie-btn-save"
                >
                  <Check size={15} /> Save Preferences
                </button>
                <button 
                  type="button" 
                  onClick={handleAcceptAll} 
                  className="nis-cookie-btn nis-cookie-btn-primary"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
