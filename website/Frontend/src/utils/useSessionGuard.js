import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { authApi, ACTIVITY_KEY } from '../services/authApi';

const CHECK_INTERVAL_MS = 15 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const ACTIVITY_WRITE_THROTTLE_MS = 20 * 1000;
const DEFAULT_IDLE_MINUTES = 30;

// Enforces the login policy client-side: idle auto-logout, the absolute
// one-day cap, and server-side revocation surfaced by a periodic heartbeat.
export function useSessionGuard() {
  const signingOutRef = useRef(false);

  useEffect(() => {
    const policy = authApi.getSessionPolicy();
    const idleMinutes = Number(policy?.idleMinutes) || DEFAULT_IDLE_MINUTES;
    const idleMs = idleMinutes * 60 * 1000;
    const expiresAt = policy?.expiresAt ? new Date(policy.expiresAt).getTime() : null;

    const readActivity = () => {
      try {
        return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
      } catch {
        return 0;
      }
    };

    const signOut = (message) => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      toast(message, { id: 'nispl-session-guard' });
      authApi.logout();
    };

    const check = () => {
      const token = authApi.getAuthToken();
      if (!token) return;
      const now = Date.now();
      if ((expiresAt && now >= expiresAt) || !authApi.isTokenValid(token)) {
        signOut('Your session has expired. Please sign in again.');
        return;
      }
      if (now - readActivity() > idleMs) {
        signOut(`You were signed out after ${idleMinutes} minutes of inactivity.`);
      }
    };

    const heartbeat = async () => {
      if (!authApi.getAuthToken()) return;
      if (!(await authApi.verifySession())) {
        signOut('Your session has expired. Please sign in again.');
      }
    };

    let lastWrite = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite < ACTIVITY_WRITE_THROTTLE_MS) return;
      lastWrite = now;
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {
        // Storage unavailable: the per-tab check still runs off login time.
      }
    };

    const onVisibility = () => {
      if (!document.hidden) check();
    };

    const onAuthChange = () => {
      signingOutRef.current = false;
    };

    check();
    const checkTimer = setInterval(check, CHECK_INTERVAL_MS);
    const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
    const events = ['pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('nispl_auth_change', onAuthChange);

    return () => {
      clearInterval(checkTimer);
      clearInterval(heartbeatTimer);
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('nispl_auth_change', onAuthChange);
    };
  }, []);
}