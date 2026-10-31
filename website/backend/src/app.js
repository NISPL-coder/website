import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const allowedOrigins = [
  ...env.CLIENT_ORIGINS,
  'https://nispldemo.vercel.app'
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel deployment (production or preview branch)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) return true;
  // Allow localhost & local network for local testing
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  return false;
};

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
if (env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/', (req, res) => res.json({
  success: true,
  service: 'NISPL API',
  message: 'Backend server is running on Render successfully',
  environment: env.NODE_ENV,
  timestamp: new Date().toISOString(),
  endpoints: {
    health: '/api/health',
    auth: '/api/auth',
    customers: '/api/customers',
    contracts: '/api/contracts',
    users: '/api/v1/users'
  }
}));
app.get('/health', (req, res) => res.json({ success: true, service: 'NISPL API', status: 'healthy' }));
app.get('/api/health', (req, res) => res.json({ success: true, service: 'NISPL API', status: 'healthy' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/contracts', contractRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
