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
import notificationRoutes from './routes/notificationRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import { razorpayWebhookHandler } from './controllers/razorpayController.js';
import productRoutes from './routes/productRoutes.js';
import addonRoutes from './routes/addonRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import ipRoutes from './routes/ipRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const allowedOrigins = [
  ...env.CLIENT_ORIGINS,
  'https://nispldemo.vercel.app',
  'https://nispl.netlify.app'
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel deployment (production or preview branch)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) return true;
  // Allow any Netlify deployment (production or deploy previews)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(origin)) return true;
  // Allow custom NISPL production domains
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*nispl\.(in|com|app)$/.test(origin)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*netinfotechsystem\.(in|com)$/.test(origin)) return true;
  // Allow localhost & local network for local testing
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  // Allow Render hosting
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(origin)) return true;
  return false;
};

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Session-Id',
    'x-session-id',
    'X-User-Role',
    'x-user-role',
    'X-Refreshed-Token',
    'x-refreshed-token'
  ],
  exposedHeaders: ['x-refreshed-token', 'X-Refreshed-Token']
}));
app.options('*', cors());
// Razorpay signs the exact bytes it posts, so the webhook has to read them
// before the JSON parser turns them into an object.
const razorpayWebhookParser = express.raw({ type: 'application/json' });
app.post('/api/payments/razorpay/webhook', razorpayWebhookParser, razorpayWebhookHandler);
app.post('/api/v1/payments/razorpay/webhook', razorpayWebhookParser, razorpayWebhookHandler);
// A scan of the cheque travels inside the same request as the payment itself,
// and base64 is a third larger than the file, so the manual endpoints need a
// parser that can carry a 5 MB document. Every other route keeps 1 MB.
const manualPaymentParser = express.json({ limit: '8mb' });
app.use('/api/payments/manual', manualPaymentParser);
app.use('/api/v1/payments/manual', manualPaymentParser);
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
    notifications: '/api/notifications',
    users: '/api/v1/users'
  }
}));
app.get('/health', (req, res) => res.json({ success: true, service: 'NISPL API', status: 'healthy' }));
app.get('/api/health', (req, res) => res.json({ success: true, service: 'NISPL API', status: 'healthy' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/v1/activity-logs', activityLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/payments/razorpay', razorpayRoutes);
app.use('/api/payments/razorpay', razorpayRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/products', productRoutes);
app.use('/api/v1/addons', addonRoutes);
app.use('/api/addons', addonRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/v1/ip-monitor', ipRoutes);
app.use('/api/ip-monitor', ipRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
