import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import careerRouter from './routes/careerRoutes.js';
import authRouter from './routes/authRoutes.js';

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

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, tests)
    if (!origin) return callback(null, true);
    
    // Check against configured origins or local development ports
    const allowed = config.corsOrigin.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin.startsWith('http://localhost:') || 
             origin.startsWith('http://127.0.0.1:');
    });

    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount Routers
app.use('/api/career', careerRouter);
app.use('/api/auth', authRouter);

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
      authForgotPassword: 'POST /api/auth/forgot-password'
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

// Start Server if not imported as a test module
const PORT = config.port;
const isMain = process.argv[1] && url.pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain && process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB Atlas
  connectDB().then(async (conn) => {
    if (conn) {
      await User.seedDefaultUsers();
    }
  }).catch((err) => {
    console.error('[Server] MongoDB initialization notice:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`NISPL Backend Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv} | Timezone: ${config.timezone}`);
    console.log(`Database: MongoDB Atlas (${config.mongoUri ? 'Active' : 'Unconfigured'})`);
    console.log(`Auth Endpoints: http://localhost:${PORT}/api/auth/register & /login`);
    console.log(`Career API Endpoint: http://localhost:${PORT}/api/career/apply`);
    console.log(`=======================================================`);
  });
}

export { app };
export default app;
