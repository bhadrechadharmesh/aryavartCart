const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { createPaymentIntent } = require('../utils/payment');
const { sendOrderConfirmation } = require('../utils/emailService');

// Helper — forward order to supplier (dropship logic)
const sendOrderToSupplier = async (order) => {
  try {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).populate('supplierId');
      if (product && product.supplierId) {
        const supplier = product.supplierId;
        // In production, this would be an HTTP call to supplier.apiEndpoint
        console.log(
          `📦 Forwarding order item "${item.name}" to supplier "${supplier.name}" at ${supplier.apiEndpoint}`
        );
      }
    }
    return true;
  } catch (error) {
    console.error('Supplier notification error:', error.message);
    return false;
  }
};

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice,
      taxPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      totalPrice,
      shippingPrice: shippingPrice || 0,
      taxPrice: taxPrice || 0,
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Forward to supplier (dropship)
    const notified = await sendOrderToSupplier(order);
    order.supplierNotified = notified;
    await order.save();

    // Send confirmation email
    sendOrderConfirmation(order, req.user.email).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check ownership or admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized');
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = req.body.orderStatus || order.orderStatus;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/orders/payment-intent
exports.createPayment = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount');
    }
    const paymentIntent = await createPaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/orders/stats
exports.getOrderStats = async (req, res, next) => {
  try {
    const [totalOrders, totalSales, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.name',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders,
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      recentOrders,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
};
