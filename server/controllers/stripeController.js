const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

const createCheckoutSession = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !items.length || totalAmount == null) {
      return res.status(400).json({ success: false, message: 'Invalid cart data' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/orders?success=true`,
      cancel_url: `${baseUrl}/cart?cancelled=true`,
      metadata: {
        totalAmount: String(totalAmount),
      },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, message: 'Checkout error', error: error.message });
  }
};

// Webhook handler for payment completion (optional, keeps order status tidy in dev)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;
  try {
    if (!endpointSecret) {
      // In test mode without webhook secret, just acknowledge
      return res.json({ received: true });
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Here you could mark orders paid; kept minimal for internship scope
    console.log('Checkout session completed:', session.id);
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, stripeWebhook };
