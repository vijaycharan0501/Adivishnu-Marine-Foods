const Product = require('../models/Product');

// @desc    Create a product (Farmer)
// @route   POST /api/products
// @access  Private/Farmer
const createProduct = async (req, res) => {
  try {
    const { name, quantity, piecesPerKg, expectedPrice, image } = req.body;

    const product = new Product({
      farmer: req.user._id,
      name,
      quantity,
      piecesPerKg,
      expectedPrice,
      image,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (Admin: all, Buyer: only approved, Farmer: only own)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    let products;
    if (req.user.role === 'admin') {
      products = await Product.find({}).populate('farmer', 'name email phone companyName');
    } else if (req.user.role === 'buyer') {
      products = await Product.find({ status: 'approved' }).populate('farmer', 'name companyName email phone');
    } else if (req.user.role === 'farmer') {
      products = await Product.find({ farmer: req.user._id });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product status (Admin only)
// @route   PUT /api/products/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res) => {
  try {
    const { status, finalPrice } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.status = status || product.status;
      if (finalPrice) {
        product.finalPrice = finalPrice;
      }
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product directly as Admin for Ecommerce
// @route   POST /api/products/admin
// @access  Private/Admin
const createAdminProduct = async (req, res) => {
  try {
    const { name, category, quantity, piecesPerKg, expectedPrice, image, stock, ecommerceStatus } = req.body;

    const product = new Product({
      name,
      category,
      quantity,
      piecesPerKg,
      expectedPrice,
      image,
      stock: stock || 0,
      ecommerceStatus: ecommerceStatus || 'draft',
      status: 'approved', // Bypass negotiation for admin products
      finalPrice: expectedPrice
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an Admin/Ecommerce product
// @route   PUT /api/products/admin/:id
// @access  Private/Admin
const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.quantity = req.body.quantity !== undefined ? req.body.quantity : product.quantity;
      product.piecesPerKg = req.body.piecesPerKg || product.piecesPerKg;
      product.expectedPrice = req.body.expectedPrice || product.expectedPrice;
      product.finalPrice = req.body.expectedPrice || product.finalPrice;
      product.image = req.body.image || product.image;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      product.ecommerceStatus = req.body.ecommerceStatus || product.ecommerceStatus;

      const updatedProduct = await product.save();

      // Emit socket event for real-time buyer dashboard update if published
      const io = req.app.get('io');
      if (io) {
         io.emit('ecommerce_product_updated', updatedProduct);
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/admin/:id
// @access  Private/Admin
const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createProduct, 
  getProducts, 
  updateProductStatus,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
};
