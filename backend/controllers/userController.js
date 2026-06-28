const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

const seedCloud = async (req, res) => {
  try {
    // Delete existing
    await User.deleteMany({ email: { $ne: 'admin@adivishnu.com' } });
    await Product.deleteMany();
    await Order.deleteMany();

    const farmers = [];
    for (let i = 1; i <= 10; i++) {
      farmers.push({
        name: `Contractor ${i}`,
        email: `contractor${i}@adivishnu.com`,
        password: 'password123',
        role: 'farmer',
        phone: `+91 987654321${i}`,
        companyName: `AquaFarm ${i} Ltd`
      });
    }
    const createdFarmers = await User.insertMany(farmers);

    const products = [];
    const categories = ['Vannamei Shrimp', 'Tiger Prawns', 'White Shrimp', 'Sea Catch'];
    for (const farmer of createdFarmers) {
      products.push({
        farmer: farmer._id,
        name: `Premium ${categories[Math.floor(Math.random() * categories.length)]}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        quantity: Math.floor(Math.random() * 1000) + 100,
        piecesPerKg: '20-30',
        expectedPrice: Math.floor(Math.random() * 200) + 300,
        image: 'https://images.unsplash.com/photo-1625944227376-7788410b0373?q=80&w=1543&auto=format&fit=crop',
        status: 'approved',
        ecommerceStatus: 'published',
        stock: 500,
        finalPrice: Math.floor(Math.random() * 200) + 350
      });
    }
    await Product.insertMany(products);

    res.json({ message: 'Cloud Database Seeded Successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

module.exports = {
  getContractors,
  seedCloud
};
