const Inquiry = require('../models/Inquiry');

// @desc    Get inquiries
// @route   GET /api/inquiries
// @access  Private
const getInquiries = async (req, res) => {
  try {
    let inquiries;
    if (req.user.role === 'admin') {
      inquiries = await Inquiry.find().sort({ createdAt: -1 }).populate('buyer', 'name email');
    } else if (req.user.role === 'buyer') {
      inquiries = await Inquiry.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an inquiry
// @route   POST /api/inquiries
// @access  Private/Buyer
const createInquiry = async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can make custom inquiries' });
    }

    const { productName, estimatedQuantity, message } = req.body;

    const inquiry = await Inquiry.create({
      buyer: req.user._id,
      productName,
      estimatedQuantity,
      message
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, adminReply } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    if (adminReply) inquiry.adminReply = adminReply;

    const updatedInquiry = await inquiry.save();
    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInquiries,
  createInquiry,
  updateInquiryStatus
};
