import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Lenient auth: populates req.user if valid token provided, but does not block requests
const permissiveAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  authenticate(req, res, () => next());
};

router.get('/', getProducts);
router.post('/', permissiveAuth, createProduct);
router.put('/:id', permissiveAuth, updateProduct);
router.patch('/:id', permissiveAuth, updateProduct);
router.delete('/:id', permissiveAuth, deleteProduct);

export default router;
