import express from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { 
  submitApplication, 
  getHealth, 
  listPendingNotifications, 
  retryNotificationHandler 
} from '../controllers/careerController.js';
import { config } from '../config/index.js';

const router = express.Router();

// In-memory Multer configuration for secure file buffer inspection
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxResumeSizeMb * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Basic pre-filter (deep magic byte verification is performed in controller)
    const allowed = config.allowedMimeTypes.includes(file.mimetype.toLowerCase()) || 
                    file.mimetype === 'application/octet-stream';
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Rate limiter for career application submissions (prevents automated spam/DoS)
const applicationRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false
});

// Public Application endpoint
router.post(
  '/apply',
  applicationRateLimiter,
  (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: `File size exceeds the allowed limit of ${config.maxResumeSizeMb} MB.`
          });
        }
        return res.status(400).json({
          success: false,
          error: `File upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      next();
    });
  },
  submitApplication
);

// Health check endpoint
router.get('/health', getHealth);

// Admin notification management endpoints
router.get('/pending-notifications', listPendingNotifications);
router.post('/retry-notification/:applicationId', retryNotificationHandler);

export default router;
