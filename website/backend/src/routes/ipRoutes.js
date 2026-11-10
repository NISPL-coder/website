import express from 'express';
import { getIps, createIp, updateIp, deleteIp } from '../controllers/ipController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * Optional authentication: authenticates if token is present,
 * but allows management even if token is absent/in transition.
 */
const optionalAuthenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || token === 'null' || token === 'undefined') {
    return next();
  }
  try {
    return await authenticate(req, res, next);
  } catch {
    return next();
  }
};

router.use(optionalAuthenticate);

// GET /api/ip-monitor
router.get('/', getIps);

// POST /api/ip-monitor
router.post('/', createIp);

// PUT /api/ip-monitor/:id
router.put('/:id', updateIp);

// DELETE /api/ip-monitor/:id
router.delete('/:id', deleteIp);

export default router;

