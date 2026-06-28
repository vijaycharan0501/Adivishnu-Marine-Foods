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

    const contractorNames = [
      "Ramesh Reddy", "Suresh Kumar", "Venkatesh Rao", "Anjali Desai",
      "Karthik Sharma", "Meena Iyer", "Prakash Verma", "Lakshmi Narayan",
      "Rajesh Khanna", "Vikram Singh"
    ];

    const contractors = [];
    for (let i = 1; i <= 10; i++) {
      const contractor = await User.create({
        name: contractorNames[i - 1],
        email: `contractor${i}@adivishnu.com`,
        password: 'contractor123',
        phone: `987654321${i-1}`,
        role: 'farmer'
      });
      contractors.push(contractor);
    }

    const farmer1 = contractors[0];
    const farmer2 = contractors[1];
    const farmer3 = contractors[2];
    const farmer4 = contractors[3];

    const buyer1 = await User.create({ name: 'Global Exports Ltd', email: 'buyer@global.com', password: 'password123', role: 'buyer', companyName: 'Global Exports', phone: '9876543212' });
    const buyer2 = await User.create({ name: 'Coastal Traders', email: 'buyer2@global.com', password: 'password123', role: 'buyer', companyName: 'Coastal Traders', phone: '9876543244' });
    const buyer3 = await User.create({ name: 'Metro Wholesale', email: 'buyer3@global.com', password: 'password123', role: 'buyer', companyName: 'Metro Wholesale', phone: '9876543255' });

    await Product.create({ farmer: farmer1._id, name: 'Vannamei Shrimp', quantity: 500, piecesPerKg: '20-25', expectedPrice: 450, image: '/images/shrimp1.png', status: 'pending', ecommerceStatus: 'published', stock: 500 });
    await Product.create({ farmer: farmer2._id, name: 'Tiger Prawns', quantity: 200, piecesPerKg: '10-15', expectedPrice: 800, image: '/images/prawn1.png', status: 'negotiating', ecommerceStatus: 'published', stock: 200 });
    const p3 = await Product.create({ farmer: farmer1._id, name: 'Whiteleg Shrimp', quantity: 1000, piecesPerKg: '30-40', expectedPrice: 350, finalPrice: 340, image: '/images/shrimp1.png', status: 'approved', ecommerceStatus: 'published', stock: 1000 });
    const p4 = await Product.create({ farmer: farmer2._id, name: 'Black Tiger Prawns', quantity: 300, piecesPerKg: '15-20', expectedPrice: 700, finalPrice: 680, image: '/images/prawn1.png', status: 'approved', ecommerceStatus: 'published', stock: 300 });
    await Product.create({ farmer: farmer3._id, name: 'Indian White Prawn', quantity: 800, piecesPerKg: '25-30', expectedPrice: 500, image: '/images/shrimp1.png', status: 'pending', ecommerceStatus: 'published', stock: 800 });
    const p6 = await Product.create({ farmer: farmer3._id, name: 'Fresh Scampi', quantity: 150, piecesPerKg: '8-12', expectedPrice: 950, finalPrice: 900, image: '/images/prawn1.png', status: 'approved', ecommerceStatus: 'published', stock: 150 });
    await Product.create({ farmer: farmer4._id, name: 'Blue Crab', quantity: 100, piecesPerKg: '3-5', expectedPrice: 1200, status: 'pending', ecommerceStatus: 'published', stock: 100 });
    await Product.create({ farmer: farmer4._id, name: 'Mud Crab', quantity: 50, piecesPerKg: '1-2', expectedPrice: 1500, status: 'negotiating', ecommerceStatus: 'published', stock: 50 });

    await Order.create({ buyer: buyer1._id, product: p3._id, quantity: 500, totalAmount: 500 * 340, status: 'pending_verification', paymentStatus: 'pending' });
    await Order.create({ buyer: buyer1._id, product: p4._id, quantity: 300, totalAmount: 300 * 680, status: 'confirmed', paymentStatus: 'partial_paid' });
    await Order.create({ buyer: buyer2._id, product: p6._id, quantity: 150, totalAmount: 150 * 900, status: 'completed', paymentStatus: 'paid' });
    await Order.create({ buyer: buyer3._id, product: p4._id, quantity: 100, totalAmount: 100 * 680, status: 'pending_verification', paymentStatus: 'pending' });

    res.json({ message: 'Cloud Database Seeded Successfully with all Orders and Names!' });
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

module.exports = {
  getContractors,
  seedCloud
};
