import { authApi } from './authApi';
import { getSessionId } from './cartApi';

const isLocalhost = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  )
);

const BACKEND_URL = isLocalhost
  ? 'http://localhost:4000'
  : (import.meta.env.VITE_API_URL || 'https://website-ebxf.onrender.com');

const API_BASE_URL = `${BACKEND_URL}/api/payments/razorpay`;

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function getHeaders() {
  const token = authApi.getAuthToken();
  return {
    'Content-Type': 'application/json',
    // The server prices a cart checkout from the session's own cart.
    'X-Session-Id': getSessionId(),
    ...(token ? { Authorization: `Bearer ${token}` } : null)
  };
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : null)
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the payment service. Please ensure the backend server is running and try again.');
  }

  const refreshed = res?.headers?.get('x-refreshed-token');
  if (refreshed) {
    try {
      localStorage.setItem('nispl_auth_token', refreshed);
    } catch {}
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    if (res.status === 401) {
      const error = new Error('Your session has expired. Please log in again to complete your payment.');
      error.statusCode = 401;
      throw error;
    }
    const error = new Error(data.error || data.message || 'The payment service is unreachable right now.');
    // 202 means Razorpay took the money and the ledger is still catching up.
    error.statusCode = res.status;
    throw error;
  }

  return data.data;
}

let scriptPromise = null;

/** Injects Razorpay's own checkout bundle once, straight from their CDN. */
export function loadRazorpayCheckout() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export const razorpayApi = {
  getConfig: () => request('/config'),

  /** Asks the server what this account owes and opens a gateway order for it. */
  createOrder: (scope) => request('/order', { method: 'POST', body: scope }),

  /** The server checks Razorpay's signature before anything is written. */
  verifyPayment: ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) =>
    request('/verify', {
      method: 'POST',
      body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    }),

  loadCheckoutScript: loadRazorpayCheckout
};

export default razorpayApi;
