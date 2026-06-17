const express = require('express');
const router = express.Router();
const { startNegotiation, addOffer, updateNegotiationStatus, updateContactDetails } = require('../controllers/negotiationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, startNegotiation);
router.post('/:id/offer', protect, addOffer);
router.put('/:id/status', protect, updateNegotiationStatus);
router.put('/:id/contact', protect, updateContactDetails);

module.exports = router;
