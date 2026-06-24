const express = require('express');
const router = express.Router();
const {
  getInquiries,
  createInquiry,
  updateInquiryStatus
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInquiries).post(protect, createInquiry);
router.route('/:id/status').put(protect, updateInquiryStatus);

module.exports = router;
