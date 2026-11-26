import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../../services/authApi';

const SCRIPT_ID = 'cf-turnstile-script';

let cachedSiteKeyPromise = null;

function fetchBackendTurnstileSiteKey() {
  if (!cachedSiteKeyPromise) {
    cachedSiteKeyPromise = authApi
      .getAdminConfig()
      .then((res) => String(res?.turnstileSiteKey || '').trim())
      .catch(() => '');
  }
  return cachedSiteKeyPromise;
}

/**
 * Renders the "Let us know you're human" label and Cloudflare Turnstile widget
 * below the password field, using TURNSTILE_SITE_KEY from Backend/.env.
 */
export default function TurnstileWidget({ siteKey, onVerify, onExpire }) {
  const isLocalHost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  const propKey = String(siteKey || import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
  const [resolvedSiteKey, setResolvedSiteKey] = useState(propKey || '');
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (isLocalHost) return undefined;
    if (propKey) {
      setResolvedSiteKey(propKey);
      return undefined;
    }
    let active = true;
    fetchBackendTurnstileSiteKey().then((backendKey) => {
      if (active) {
        setResolvedSiteKey(backendKey);
      }
    });
    return () => {
      active = false;
    };
  }, [propKey]);

  useEffect(() => {
    if (isLocalHost || !resolvedSiteKey) return undefined;

    let cancelled = false;
    setLoadFailed(false);

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: resolvedSiteKey,
        theme: 'light',
        size: 'flexible',
        callback: (token) => onVerify?.(token),
        'expired-callback': () => {
          onVerify?.('');
          onExpire?.();
        },
        'error-callback': () => onVerify?.('')
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(SCRIPT_ID);
      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      const onError = () => {
        if (!cancelled) setLoadFailed(true);
      };
      script.addEventListener('load', renderWidget);
      script.addEventListener('error', onError);
      return () => {
        cancelled = true;
        script.removeEventListener('load', renderWidget);
        script.removeEventListener('error', onError);
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [resolvedSiteKey]);

  if (isLocalHost || !resolvedSiteKey) return null;

  return (
    <div style={{ margin: '14px 0 16px', width: '100%' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.84rem',
          fontWeight: 500,
          color: '#475569',
          marginBottom: '8px',
          textAlign: 'left'
        }}
      >
        Let us know you&apos;re human
      </label>

      {loadFailed ? (
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '12px 14px',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#334155'
          }}
        >
          <span>Verify you are human</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f97316' }}>CLOUDFLARE</span>
        </div>
      ) : (
        <div ref={containerRef} style={{ width: '100%', minHeight: '65px' }} />
      )}
    </div>
  );
}
