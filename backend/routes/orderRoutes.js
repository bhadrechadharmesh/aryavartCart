const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createPayment,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/payment-intent', protect, createPayment);
router.get('/stats', protect, authorize('admin'), getOrderStats);
router.get('/myorders', protect, getMyOrders);
router.route('/').post(protect, createOrder).get(protect, authorize('admin'), getAllOrders);
router.route('/:id').get(protect, getOrderById);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
