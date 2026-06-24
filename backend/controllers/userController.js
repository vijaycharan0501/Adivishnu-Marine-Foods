const User = require('../models/User');

// @desc    Get all contractors (farmers)
// @route   GET /api/users/contractors
// @access  Private/Admin
const getContractors = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const contractors = await User.find({ role: 'farmer' }).select('-password');
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContractors
};
