import { Router } from 'express';
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  updateFulfillment,
  getAddons
} from '../controllers/cartController.js';

const router = Router();

router.get('/', getCart);
router.get('/addons', getAddons);
router.post('/add', addItem);
router.post('/update-qty', updateQuantity);
router.post('/remove', removeItem);
router.post('/clear', clearCart);
router.post('/fulfillment', updateFulfillment);

export default router;
