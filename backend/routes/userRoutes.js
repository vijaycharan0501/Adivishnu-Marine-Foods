const express = require('express');
const router = express.Router();
const { getContractors, seedCloud } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/contractors').get(protect, getContractors);
router.route('/seed-cloud').get(seedCloud);

module.exports = router;
