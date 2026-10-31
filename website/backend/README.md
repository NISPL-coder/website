# NISPL Authentication Backend

Node.js + Express + MongoDB authentication API for the Admin, Partner and Customer portals in the supplied LoginPage.jsx.

## Important integration notes

- Uses the existing project style: ES modules, `server.js`, Express routes/controllers/middleware and MongoDB.
- `POST /api/v1/auth/login` accepts `{ "email": "...", "password": "...", "portal": "admin|partner|customer" }`.
- Login response includes `accessToken` and a database-backed `user` object. This preserves `response.user.email`, `response.user.name`, and `response.user.tier` usage in the UI.
- Refresh token is stored in an HttpOnly cookie. Frontend requests must use `credentials: 'include'`.
- The selected portal must match the account role stored in MongoDB.
- Public registration creates customer accounts only. Admin/partner accounts must be created by an authenticated admin.
- No default admin account or default credentials are created. Create the first admin through a one-time secure database seed/controlled deployment process (see below).

## Setup

1. Place this backend in `website/backend` (or merge the `src` files into your existing backend after backing it up).
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI`, two different random JWT secrets (32+ characters), frontend origins and SMTP settings.
5. Run `npm run dev`.
6. Check `GET http://localhost:4000/api/health`.

Generate secrets with Node:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public + rate limited | Admin/partner/customer login |
| POST | `/api/v1/auth/register` | Public + rate limited | Customer registration |
| GET | `/api/v1/auth/me` | Authenticated | Current user profile |
| POST | `/api/v1/auth/refresh` | Refresh cookie | Rotate refresh session |
| POST | `/api/v1/auth/logout` | Refresh cookie | Revoke session and clear cookie |
| POST | `/api/v1/auth/forgot-password` | Public + rate limited | Send reset email |
| POST | `/api/v1/auth/reset-password` | Public + rate limited | Consume reset token |
| GET | `/api/v1/users` | Admin | Search/filter/paginate users |
| POST | `/api/v1/users` | Admin | Create admin/partner/customer |
| PATCH | `/api/v1/users/:id` | Admin | Update profile/access metadata/status |
| PATCH | `/api/v1/users/me/password` | Authenticated | Change own password |

### Login request

```json
{
  "email": "registered@example.com",
  "password": "the-user-password",
  "portal": "partner"
}
```

`email` also accepts a customer ID in the same field. Do not send the portal role from a trusted source; it is only a requested portal and the API checks it against the database role.

### Customer registration

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "A-long-unique-password"
}
```

The API assigns a unique customer ID. Do not accept `role`, `tier`, `permissions`, or `accountStatus` from public registration.

### Admin-created account

```json
{
  "name": "Partner Name",
  "email": "partner@example.com",
  "password": "A-long-unique-password",
  "role": "partner",
  "tier": "Gold",
  "permissions": ["dashboard.read", "customers.read"],
  "securityLevel": "Standard",
  "location": "Kolkata",
  "accountStatus": "active"
}
```

Only an authenticated admin can call this endpoint.

## Frontend authApi example

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const token = localStorage.getItem('nispl_access_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  if (data.accessToken) localStorage.setItem('nispl_access_token', data.accessToken);
  return data;
}

export const authApi = {
  login: credentials => request('/api/v1/auth/login', {
    method: 'POST', body: JSON.stringify(credentials)
  }),
  register: details => request('/api/v1/auth/register', {
    method: 'POST', body: JSON.stringify(details)
  }),
  getMe: () => request('/api/v1/auth/me'),
  refresh: () => request('/api/v1/auth/refresh', { method: 'POST' }),
  logout: () => request('/api/v1/auth/logout', { method: 'POST' }),
  forgotPassword: email => request('/api/v1/auth/forgot-password', {
    method: 'POST', body: JSON.stringify({ email })
  }),
  resetPassword: (token, password) => request('/api/v1/auth/reset-password', {
    method: 'POST', body: JSON.stringify({ token, password })
  })
};
```

Set frontend `.env`:
`VITE_API_BASE_URL=http://localhost:4000`

For production, use your deployed backend HTTPS URL. Do not expose MongoDB credentials, SMTP credentials or JWT secrets in frontend variables.

## First admin account

There is intentionally no hardcoded admin email/password or public admin registration route.

Create the first admin through a controlled one-time script or direct secured provisioning process. Example script can be added after you confirm the first admin provisioning method. Never commit real credentials or seed passwords to Git.

## Deployment

- Backend root directory: `backend`
- Build/install command: `npm install`
- Start command: `npm start`
- Bind address: `0.0.0.0` (already configured)
- Set `PORT` from hosting provider.
- Set `CLIENT_ORIGINS` to the exact deployed frontend origin(s), comma-separated.
- Set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` when frontend and API are on different HTTPS sites.
- Configure MongoDB Atlas Network Access for the backend host and a least-privilege database user.

## Production checklist

- Use HTTPS everywhere.
- Use strong, different JWT secrets in deployment secrets.
- Configure SMTP before enabling password recovery.
- Restrict CORS to trusted frontend origins.
- Keep refresh tokens in HttpOnly cookies; do not put refresh tokens in localStorage.
- Add an audited first-admin provisioning procedure.
- Configure backups, monitoring and log retention.
- Add CSRF protection appropriate to your deployment when using cross-site cookies.
- Review permissions for every protected business API, not just the login endpoints.
