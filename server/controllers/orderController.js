const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    // Server-side price verification: look up actual product prices
    const verifiedItems = [];
    let computedTotal = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        // Rollback any items already processed
        for (const vItem of verifiedItems) {
          await Product.findByIdAndUpdate(vItem.product, { $inc: { stock: vItem.quantity } });
        }
        return res.status(400).json({ success: false, message: 'Each item must have a valid product and quantity' });
      }

      const qty = Math.floor(item.quantity);
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!product) {
        // Rollback any items already processed
        for (const vItem of verifiedItems) {
          await Product.findByIdAndUpdate(vItem.product, { $inc: { stock: vItem.quantity } });
        }
        return res.status(400).json({ success: false, message: `Product not found or out of stock: ${item.product}` });
      }

      verifiedItems.push({
        product: product._id,
        name: product.name,
        quantity: qty,
        price: product.price,
      });

      computedTotal += product.price * qty;
    }

    // Round to 2 decimal places to avoid floating-point issues
    computedTotal = Math.round(computedTotal * 100) / 100;

    // NEW-001: Deduplication check to prevent order flooding/replay
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentDuplicate = await Order.findOne({
      user: req.user.id,
      'items.product': { $all: verifiedItems.map(i => i.product) },
      createdAt: { $gte: oneMinuteAgo }
    });
    
    if (recentDuplicate && recentDuplicate.items.length === verifiedItems.length) {
      return res.status(409).json({ success: false, message: 'Duplicate order detected. Please wait a moment before placing another order.' });
    }

    const order = await Order.create({
      user: req.user.id,
      items: verifiedItems,
      totalAmount: computedTotal,
    });

    const orderPopulated = await Order.findById(order._id).populate('items.product', 'name');

    res.status(201).json({ success: true, order: orderPopulated });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only owner or admin can see
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status } = req.query;
    // SEC-007: Validate status against allowed enum to prevent NoSQL operator injection
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const query = status && status !== 'all' && typeof status === 'string' && allowedStatuses.includes(status)
      ? { status }
      : {};
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { status } = req.body;
    // Validate status value
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // NEW-003: Atomic update to prevent TOCTOU race conditions
    // Only update if status is 'Processing'
    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, status: 'Processing' },
      { status: 'Cancelled' },
      { new: true }
    ).populate('items.product', 'name');

    if (!updated) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled. It may have already been shipped or cancelled.' });
    }

    res.json({ success: true, order: updated });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
