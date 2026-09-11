const express = require('express');
const { createCheckoutSession, stripeWebhook } = require('../controllers/stripeController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
