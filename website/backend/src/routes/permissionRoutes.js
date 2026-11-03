import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { columnRegistryForClient } from '../utils/columnPermissions.js';

const router = Router();

router.use(authenticate);

// The grant UI builds its column picker from this instead of keeping a second
// copy of the inventory that could drift from what the API actually redacts.
router.get('/columns', (req, res) => {
  res.json({ success: true, registry: columnRegistryForClient() });
});

export default router;
