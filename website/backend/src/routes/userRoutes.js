import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/authenticate.js';
import { validateBody, adminCreateUserSchema } from '../middleware/validate.js';
import { listUsers, createUser, updateUser, changeOwnPassword } from '../controllers/userController.js';

const router = Router();
router.use(authenticate);
router.get('/', authorizeRole('admin'), listUsers);
router.post('/', authorizeRole('admin'), validateBody(adminCreateUserSchema), createUser);
router.patch('/:id', authorizeRole('admin'), updateUser);
router.patch('/me/password', changeOwnPassword);

export default router;
