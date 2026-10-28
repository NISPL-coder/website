import express from 'express';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  updateFulfillmentMode,
  getCartAddons
} from '../controllers/cartController.js';

const router = express.Router();

// Support both logged-in users and guest sessions
router.use(optionalAuthenticate);

/**
 * @route   GET /api/cart
 * @desc    Fetch active cart items and financial totals
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add product or add-on to cart
 */
router.post('/add', addToCart);

/**
 * @route   POST /api/cart/update-qty
 * @desc    Update item quantity in cart
 */
router.post('/update-qty', updateCartItemQuantity);
router.put('/item/:id', updateCartItemQuantity);

/**
 * @route   POST /api/cart/remove
 * @desc    Remove an item from cart
 */
router.post('/remove', removeCartItem);
router.delete('/item/:id', removeCartItem);

/**
 * @route   POST /api/cart/clear
 * @desc    Empty cart
 */
router.post('/clear', clearCart);

/**
 * @route   POST /api/cart/fulfillment
 * @desc    Update fulfillment / shipping mode
 */
router.post('/fulfillment', updateFulfillmentMode);

/**
 * @route   GET /api/cart/addons
 * @desc    Fetch recommended enterprise add-ons list
 */
router.get('/addons', getCartAddons);

export default router;
