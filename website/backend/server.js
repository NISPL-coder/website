import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import careerRouter from './routes/careerRoutes.js';

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

// Mount Career API Router
app.use('/api/career', careerRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Net Infotech System Pvt. Ltd. (NISPL) Backend API',
    status: 'online',
    endpoints: {
      health: '/api/career/health',
      apply: 'POST /api/career/apply'
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
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`NISPL Backend Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv} | Timezone: ${config.timezone}`);
    console.log(`Career API Endpoint: http://localhost:${PORT}/api/career/apply`);
    console.log(`=======================================================`);
  });
}

export { app };
export default app;
