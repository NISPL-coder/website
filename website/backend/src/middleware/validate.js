import { HttpError } from '../utils/httpError.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema(req.body || {});
    if (!result.valid) return next(new HttpError(400, result.message));
    req.body = result.value;
    next();
  };
}

const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const loginSchema = body => {
  const identifier = String(body.email ?? body.identifier ?? '').trim();
  const password = String(body.password ?? '');
  const portal = String(body.portal ?? '').trim().toLowerCase();
  if (!identifier) return { valid: false, message: 'Email or account ID is required.' };
  if (!password) return { valid: false, message: 'Password is required.' };
  if (!['admin', 'partner', 'customer'].includes(portal)) return { valid: false, message: 'A valid portal is required.' };
  return { valid: true, value: { identifier, password, portal } };
};

export const registerSchema = body => {
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (name.length < 2) return { valid: false, message: 'Name must contain at least 2 characters.' };
  if (!emailOk(email)) return { valid: false, message: 'A valid email address is required.' };
  if (password.length < 10) return { valid: false, message: 'Password must contain at least 10 characters.' };
  return { valid: true, value: { name, email, password } };
};

export const forgotSchema = body => {
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!emailOk(email)) return { valid: false, message: 'A valid email address is required.' };
  return { valid: true, value: { email } };
};

export const resetSchema = body => {
  const token = String(body.token ?? '').trim();
  const password = String(body.password ?? '');
  if (!token) return { valid: false, message: 'Reset token is required.' };
  if (password.length < 10) return { valid: false, message: 'New password must contain at least 10 characters.' };
  return { valid: true, value: { token, password } };
};

export const adminCreateUserSchema = body => {
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const role = String(body.role ?? '').trim().toLowerCase();
  if (name.length < 2) return { valid: false, message: 'Name must contain at least 2 characters.' };
  if (!emailOk(email)) return { valid: false, message: 'A valid email address is required.' };
  if (password.length < 10) return { valid: false, message: 'Password must contain at least 10 characters.' };
  if (!['admin', 'partner', 'customer'].includes(role)) return { valid: false, message: 'Invalid role.' };
  return { valid: true, value: {
    name, email, password, role,
    tier: body.tier ? String(body.tier).trim() : null,
    permissions: Array.isArray(body.permissions) ? body.permissions.map(String) : [],
    securityLevel: body.securityLevel ? String(body.securityLevel).trim() : null,
    location: body.location ? String(body.location).trim() : null,
    accountStatus: ['active', 'inactive', 'suspended'].includes(body.accountStatus) ? body.accountStatus : 'active'
  }};
};
