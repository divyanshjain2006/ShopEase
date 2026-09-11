const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All require auth
router.post('/', authMiddleware, createOrder);
router.get('/mine', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrder);

// Admin
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.post('/:id/cancel', authMiddleware, cancelOrder);

module.exports = router;
