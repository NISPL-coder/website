import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../../services/authApi';

/**
 * Live RBAC source of truth for the admin console.
 * The backend re-reads the staff document on every request, so a grant or a
 * revocation is already enforced server-side the moment it is saved; this
 * context only keeps the UI in step without asking anyone to sign out.
 */

export const PERMISSION_MODULES = [
  'overview',
  'customer',
  'contract',
  'payment',
  'product',
  'receipt',
  'import_csv',
  'sangam_sync',
  'user_access',
  'activity_logs',
  'data_tools'
];

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'];

export const MODULE_LABELS = {
  overview: 'Overview',
  customer: 'Customer',
  contract: 'Contract',
  payment: 'Payment',
  product: 'Product',
  receipt: 'Receipt',
  import_csv: 'Import CSV',
  sangam_sync: 'Sangam Sync',
  user_access: 'User Access',
  activity_logs: 'Activity Logs',
  data_tools: 'Data Tools'
};

export const ACTION_LABELS = {
  view: 'View',
  create: 'Add',
  edit: 'Edit',
  delete: 'Delete'
};

const REFRESH_ON_FOCUS_MS = 4000;
const POLL_INTERVAL_MS = 60000;

export function isPermissionGranted(user, module, action = 'view') {
  if (!user) return false;
  if (user.role === 'admin' || user.isPrimaryAdmin) return true;

  const granted = Array.isArray(user.permissions) ? user.permissions : [];
  if (granted.includes('*') || granted.includes(`${module}:*`)) return true;
  if (granted.includes(`${module}:${action}`)) return true;

  // Compatibility alias for data_tools / import_csv / sangam_sync
  if (module === 'import_csv' || module === 'sangam_sync') {
    if (
      granted.includes('data_tools') ||
      granted.includes('data_tools:*') ||
      granted.includes(`data_tools:${action}`)
    ) {
      return true;
    }
  }
  if (module === 'data_tools') {
    if (
      isPermissionGranted(user, 'import_csv', action) ||
      isPermissionGranted(user, 'sangam_sync', action)
    ) {
      return true;
    }
  }

  // Legacy single-checkbox grants stored a bare module id, and any write grant
  // implies the module can at least be opened.
  if (action === 'view') {
    return granted.includes(module) || PERMISSION_ACTIONS.some((a) => granted.includes(`${module}:${a}`));
  }
  return false;
}

/** Expands `module:action` strings into a lookup table the grant UI renders from. */
export function toPermissionMatrix(permissions = []) {
  const matrix = {};
  for (const module of PERMISSION_MODULES) {
    matrix[module] = { view: false, create: false, edit: false, delete: false };
  }
  for (const entry of permissions) {
    const value = String(entry || '').trim();
    if (!value) continue;
    const [module, action = 'view'] = value.split(':');
    if (module === '*') {
      for (const m of PERMISSION_MODULES) {
        PERMISSION_ACTIONS.forEach((a) => { matrix[m][a] = true; });
      }
      continue;
    }
    // Backward compatibility for legacy data_tools grant
    if (module === 'data_tools') {
      const targets = ['import_csv', 'sangam_sync', 'data_tools'];
      targets.forEach((t) => {
        if (!matrix[t]) return;
        if (action === '*') {
          PERMISSION_ACTIONS.forEach((a) => { matrix[t][a] = true; });
        } else if (PERMISSION_ACTIONS.includes(action)) {
          matrix[t][action] = true;
        } else {
          matrix[t].view = true;
        }
      });
      continue;
    }
    if (!matrix[module]) continue;
    if (action === '*') {
      PERMISSION_ACTIONS.forEach((a) => { matrix[module][a] = true; });
      continue;
    }
    if (PERMISSION_ACTIONS.includes(action)) matrix[module][action] = true;
    else matrix[module].view = true;
  }
  return matrix;
}

/** Collapses the grant UI back into canonical `module:action` strings. */
export function fromPermissionMatrix(matrix) {
  const list = [];
  const exportModules = [
    'overview',
    'customer',
    'contract',
    'payment',
    'product',
    'receipt',
    'import_csv',
    'sangam_sync',
    'user_access',
    'activity_logs'
  ];
  for (const module of exportModules) {
    const flags = matrix[module] || {};
    PERMISSION_ACTIONS.forEach((action) => {
      if (flags[action]) list.push(`${module}:${action}`);
    });
  }
  return list;
}

/** Human-readable one-liner of a staff member's live access. */
export function describePermissions(user) {
  if (!user) return '—';
  if (user.role === 'admin' || user.isPrimaryAdmin) return 'Full access to every module (Administrator)';

  const matrix = toPermissionMatrix(Array.isArray(user.permissions) ? user.permissions : []);
  const parts = PERMISSION_MODULES.filter((module) =>
    PERMISSION_ACTIONS.some((action) => matrix[module][action])
  ).map((module) => {
    const actions = PERMISSION_ACTIONS.filter((action) => matrix[module][action]).map((a) => ACTION_LABELS[a]);
    return `${MODULE_LABELS[module]} (${actions.join(', ')})`;
  });

  return parts.length ? parts.join('; ') : 'No modules granted yet';
}

const PermissionsContext = createContext(null);const signatureOf = (user) =>
  user ? `${user._id || user.id || ''}|${user.role}|${Boolean(user.isPrimaryAdmin)}|${user.accountStatus}|${[...(user.permissions || [])].sort().join(',')}` : '';

export function PermissionsProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getCurrentUser());

  const applyProfile = useCallback((fresh) => {
    if (!fresh) return;
    setUser((prev) => (signatureOf(prev) === signatureOf(fresh) ? prev : fresh));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const fresh = await authApi.getProfile();
      applyProfile(fresh);
    } catch (err) {
      console.warn('[permissions] Could not refresh live permissions:', err?.message);
    }
  }, [applyProfile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Pull the authoritative permission set whenever the console regains attention
  useEffect(() => {
    let timer = null;
    const scheduledRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, REFRESH_ON_FOCUS_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', scheduledRefresh);
    window.addEventListener('nispl_permissions_changed', scheduledRefresh);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('focus', scheduledRefresh);
      window.removeEventListener('nispl_permissions_changed', scheduledRefresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  const value = useMemo(() => {
    const can = (module, action = 'view') => isPermissionGranted(user, module, action);
    return {
      user,
      role: user?.role || 'support',
      isAdmin: user?.role === 'admin' || Boolean(user?.isPrimaryAdmin),
      isPrimaryAdmin: Boolean(user?.isPrimaryAdmin),
      permissions: user?.permissions || [],
      can,
      refresh,
      // The cached session is enough to render immediately; a signed-in admin
      // never has to wait on the network to see their own navigation.
      isReady: Boolean(user)
    };
  }, [user, refresh]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used inside <PermissionsProvider>.');
  return ctx;
}

export default PermissionsProvider;
