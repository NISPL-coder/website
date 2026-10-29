import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import careerRouter from './routes/careerRoutes.js';
import authRouter from './routes/authRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import cartRouter from './routes/cartRoutes.js';

const app = express();

// Request logging (sanitized - no personal info or file contents)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Permitted origin validation helper
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (e.g. server-to-server, curl, tests)

  // Local development ports
  if (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('https://localhost:')
  ) {
    return true;
  }

  // Allow all Vercel deployments (production, staging, branch previews) & Render subdomains
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'vercel.app' ||
      hostname.endsWith('.vercel.app') ||
      hostname === 'onrender.com' ||
      hostname.endsWith('.onrender.com') ||
      hostname === 'netinfotechsystem.in' ||
      hostname.endsWith('.netinfotechsystem.in') ||
      hostname === 'nispl.in' ||
      hostname.endsWith('.nispl.in')
    ) {
      return true;
    }
  } catch (e) {
    // Malformed origin URL, continue to string match
  }

  // Check against explicit config/environment origins
  if (Array.isArray(config.corsOrigin)) {
    return config.corsOrigin.some((allowed) => {
      if (allowed === '*') return true;
      return origin === allowed || origin.toLowerCase() === allowed.toLowerCase();
    });
  }

  return false;
};

// Robust CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unapproved origin: ${origin}`);
      // Return null, false to reject cleanly without triggering a 500 internal server error
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-session-id',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization', 'x-session-id'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Routers
app.use('/api/career', careerRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/cart', cartRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Net Infotech System Pvt. Ltd. (NISPL) Backend API',
    status: 'online',
    endpoints: {
      health: 'GET /api/career/health',
      apply: 'POST /api/career/apply',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      authProfile: 'GET /api/auth/me (Bearer Token)',
      authForgotPassword: 'POST /api/auth/forgot-password',
      dashboardOverview: 'GET /api/dashboard/overview',
      cart: 'GET /api/cart',
      cartAdd: 'POST /api/cart/add',
      cartUpdate: 'POST /api/cart/update-qty',
      cartRemove: 'POST /api/cart/remove',
      cartClear: 'POST /api/cart/clear',
      cartFulfillment: 'POST /api/cart/fulfillment',
      cartAddons: 'GET /api/cart/addons'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

import url from 'url';

// Start Server
const PORT = process.env.PORT || config.port || 5000;
let serverInstance = null;

export const startServer = (port = PORT) => {
  if (serverInstance) {
    return serverInstance;
  }

  // Connect to MongoDB Atlas
  connectDB().then(async (conn) => {
    if (conn) {
      await User.seedDefaultUsers();
    }
  }).catch((err) => {
    console.error('[Server] MongoDB initialization notice:', err.message);
  });

  serverInstance = app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`NISPL Backend Server running on port ${port} (0.0.0.0)`);
    console.log(`Environment: ${config.nodeEnv} | Timezone: ${config.timezone}`);
    console.log(`Database: MongoDB Atlas (${config.mongoUri ? 'Active' : 'Unconfigured'})`);
    console.log(`Auth Endpoints: http://localhost:${port}/api/auth/register & /login`);
    console.log(`Career API Endpoint: http://localhost:${port}/api/career/apply`);
    console.log(`=======================================================`);
  });

  return serverInstance;
};

// Start Server automatically when not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
export default app;
