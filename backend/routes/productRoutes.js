const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  updateProductStatus,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('farmer'), createProduct)
  .get(protect, getProducts);

router.route('/admin')
  .post(protect, authorize('admin'), createAdminProduct);

router.route('/admin/:id')
  .put(protect, authorize('admin'), updateAdminProduct)
  .delete(protect, authorize('admin'), deleteAdminProduct);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateProductStatus);

module.exports = router;
