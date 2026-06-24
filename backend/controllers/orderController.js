const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Buyer
const createOrder = async (req, res) => {
  try {
    const { product, quantity, totalAmount, contactDetails } = req.body;

    const orderedProduct = await Product.findById(product);

    if (orderedProduct && orderedProduct.stock !== undefined) {
      if (orderedProduct.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Only ${orderedProduct.stock} Kgs available.` });
      }
    }

    const order = new Order({
      buyer: req.user._id,
      product,
      quantity,
      totalAmount,
      contactDetails
    });

    const createdOrder = await order.save();

    // Deduct stock for Ecommerce Products
    if (orderedProduct && orderedProduct.stock !== undefined) {
      orderedProduct.stock -= quantity;
      if (orderedProduct.stock <= 0) {
        orderedProduct.ecommerceStatus = 'out_of_stock';
      }
      await orderedProduct.save();

      // Emit socket event for real-time buyer dashboard update
      const io = req.app.get('io');
      if (io) {
        io.emit('ecommerce_product_updated', orderedProduct);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find({}).populate('buyer', 'name companyName email').populate({ path: 'product', populate: { path: 'farmer', select: 'name companyName email phone' } });
    } else if (req.user.role === 'buyer') {
      orders = await Order.find({ buyer: req.user._id }).populate({ path: 'product', populate: { path: 'farmer', select: 'name companyName email phone' } });
    } else if (req.user.role === 'farmer') {
      // Need more complex aggregation to find orders of products owned by farmer
      // Assuming product is populated and we filter later or use aggregate.
      // For simplicity, skip farmer orders here or implement if needed.
      orders = [];
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, advanceAmountPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (advanceAmountPaid !== undefined) order.advanceAmountPaid = advanceAmountPaid;

      const updatedOrder = await order.save();

      // Emit socket event for real-time buyer dashboard update
      const io = req.app.get('io');
      if (io) {
        io.emit('order_status_updated', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
