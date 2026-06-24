const express = require('express');
const router = express.Router();
const { getContractors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/contractors').get(protect, getContractors);

module.exports = router;
