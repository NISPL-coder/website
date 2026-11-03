import { HttpError } from '../utils/httpError.js';

export const PERMISSION_MODULES = [
  'overview',
  'customer',
  'contract',
  'payment',
  'product',
  'receipt',
  'import_csv',
  'sangam_sync',
  'data_tools',
  'user_access',
  'activity_logs'
];

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'];

const WILDCARD = '*';

/**
 * Bare module ids granted by the legacy single-checkbox UI only open the module
 * for reading; write actions must be granted explicitly as `module:action`.
 */
export function hasPermission(user, module, action = 'view') {
  if (!user) return false;
  if (user.role === 'admin' || user.isPrimaryAdmin) return true;

  const granted = Array.isArray(user.permissions) ? user.permissions : [];
  if (granted.includes(WILDCARD) || granted.includes(`${module}:${WILDCARD}`)) return true;
  if (granted.includes(`${module}:${action}`)) return true;

  // Compatibility alias for data_tools / import_csv / sangam_sync
  if (module === 'import_csv' || module === 'sangam_sync') {
    if (
      granted.includes('data_tools') ||
      granted.includes(`data_tools:${WILDCARD}`) ||
      granted.includes(`data_tools:${action}`)
    ) {
      return true;
    }
  }
  if (module === 'data_tools') {
    if (hasPermission(user, 'import_csv', action) || hasPermission(user, 'sangam_sync', action)) {
      return true;
    }
  }

  // Any operation grant on a module implies the module can be opened and read.
  if (action === 'view') {
    return granted.includes(module) || PERMISSION_ACTIONS.some((a) => granted.includes(`${module}:${a}`));
  }
  return false;
}

export function requirePermission(module, action = 'view') {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required.'));
    if (hasPermission(req.user, module, action)) return next();
    return next(
      new HttpError(
        403,
        `Your role does not allow you to ${action} in the ${module} module. Ask an administrator for access.`
      )
    );
  };
}

/**
 * Normalises whatever the admin UI sends into a canonical `module:action` set so
 * stored permissions stay stable regardless of the granting interface version.
 */
export function normalizePermissions(input) {
  const list = Array.isArray(input) ? input : [];
  const result = new Set();
  for (const entry of list) {
    const value = String(entry || '').trim();
    if (!value) continue;
    if (value === WILDCARD) {
      result.add(WILDCARD);
      continue;
    }
    const [module, action = 'view'] = value.split(':');
    if (!PERMISSION_MODULES.includes(module)) continue;
    if (module === WILDCARD) {
      result.add(WILDCARD);
      continue;
    }
    if (!PERMISSION_ACTIONS.includes(action)) continue;
    result.add(`${module}:${action}`);
  }
  return [...result].sort();
}
