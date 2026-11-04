import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/permission.js';

const router = express.Router();

// Catalog reads stay public so the pricing pages work for visitors.
router.get('/', getProducts);

// Every write needs a signed-in admin holding the matching product grant.
router.post('/', authenticate, requirePermission('product', 'create'), createProduct);
router.put('/:id', authenticate, requirePermission('product', 'edit'), updateProduct);
router.patch('/:id', authenticate, requirePermission('product', 'edit'), updateProduct);
router.delete('/:id', authenticate, requirePermission('product', 'delete'), deleteProduct);

export default router;
