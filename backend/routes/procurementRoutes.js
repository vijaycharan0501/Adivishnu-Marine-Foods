const express = require('express');
const router = express.Router();
const {
  getProcurements,
  createProcurement,
  updateProcurementStatus,
  fulfillProcurement,
  rejectProcurement
} = require('../controllers/procurementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProcurements).post(protect, createProcurement);
router.route('/:id').put(protect, updateProcurementStatus);
router.route('/:id/fulfill').post(protect, fulfillProcurement);
router.route('/:id/reject').post(protect, rejectProcurement);

module.exports = router;
