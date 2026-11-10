import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useSessionGuard } from '../../utils/useSessionGuard';

/**
 * ProtectedRoute Component
 * Guards routes so that only users with an active token & session can access them.
 * If token is not available, expired, or invalid, user is redirected to the login page.
 */
export default function ProtectedRoute({
  children,
  allowedRoles = null,
  redirectTo = '/login'
}) {
  const location = useLocation();

  useSessionGuard();

  const [authState, setAuthState] = useState(() => ({
    isAuthed: authApi.isAuthenticated(allowedRoles),
    token: authApi.getAuthToken(),
    user: authApi.getCurrentUser()
  }));

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState({
        isAuthed: authApi.isAuthenticated(allowedRoles),
        token: authApi.getAuthToken(),
        user: authApi.getCurrentUser()
      });
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('nispl_auth_change', handleAuthChange);
    window.addEventListener('nispl_session_expired', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('nispl_auth_change', handleAuthChange);
      window.removeEventListener('nispl_session_expired', handleAuthChange);
    };
  }, [allowedRoles]);

  // If token is missing, expired, or user not authenticated
  if (!authState.isAuthed) {
    // If user has a valid token but belongs to a different portal, redirect to their home
    if (authState.token && authState.user && authApi.isTokenValid(authState.token)) {
      if (authState.user.role === 'customer' && !allowedRoles?.includes('customer')) {
        return <Navigate to="/customer/overview" replace />;
      }
      if (['admin', 'manager', 'support'].includes(authState.user.role) && !allowedRoles?.includes(authState.user.role)) {
        return <Navigate to="/admin/overview" replace />;
      }
      if (authState.user.role === 'partner' && !allowedRoles?.includes('partner')) {
        return <Navigate to="/partner-dashboard" replace />;
      }
    }

    // No token or completely unauthenticated: redirect to login page
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}

