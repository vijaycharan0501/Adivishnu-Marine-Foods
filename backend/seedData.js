const mongoose = require('mongoose');

require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adivishnu');
    console.log('MongoDB Connected for seeding dummy data...');

    // Clear existing dummy data (except admin)
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@adivishnu.com' } });

    // --- CREATE FARMERS ---
    const farmer1 = await User.create({
      name: 'Ramesh Reddy',
      email: 'ramesh@farm.com',
      password: 'password123',
      role: 'farmer',
      companyName: 'Reddy Aqua Farms',
      phone: '9876543210'
    });

    const farmer2 = await User.create({
      name: 'Suresh Kumar',
      email: 'suresh@farm.com',
      password: 'password123',
      role: 'farmer',
      companyName: 'Kumar Seafoods',
      phone: '9876543211'
    });

    const farmer3 = await User.create({
      name: 'Venkatesh Rao',
      email: 'venkatesh@farm.com',
      password: 'password123',
      role: 'farmer',
      companyName: 'Rao Coastal Farms',
      phone: '9876543222'
    });

    const farmer4 = await User.create({
      name: 'Anjali Desai',
      email: 'anjali@farm.com',
      password: 'password123',
      role: 'farmer',
      companyName: 'Desai Aquatics',
      phone: '9876543233'
    });

    // --- CREATE BUYERS ---
    const buyer1 = await User.create({
      name: 'Global Exports Ltd',
      email: 'buyer@global.com',
      password: 'password123',
      role: 'buyer',
      companyName: 'Global Exports',
      phone: '9876543212'
    });

    const buyer2 = await User.create({
      name: 'Coastal Traders',
      email: 'buyer2@global.com',
      password: 'password123',
      role: 'buyer',
      companyName: 'Coastal Traders',
      phone: '9876543244'
    });

    const buyer3 = await User.create({
      name: 'Metro Wholesale',
      email: 'buyer3@global.com',
      password: 'password123',
      role: 'buyer',
      companyName: 'Metro Wholesale',
      phone: '9876543255'
    });

    // --- CREATE PRODUCTS ---
    await Product.create({
      farmer: farmer1._id,
      name: 'Vannamei Shrimp',
      quantity: 500,
      piecesPerKg: '20-25',
      expectedPrice: 450,
      image: '/images/shrimp1.png',
      status: 'pending'
    });

    await Product.create({
      farmer: farmer2._id,
      name: 'Tiger Prawns',
      quantity: 200,
      piecesPerKg: '10-15',
      expectedPrice: 800,
      image: '/images/prawn1.png',
      status: 'negotiating'
    });

    const p3 = await Product.create({
      farmer: farmer1._id,
      name: 'Whiteleg Shrimp',
      quantity: 1000,
      piecesPerKg: '30-40',
      expectedPrice: 350,
      finalPrice: 340,
      image: '/images/shrimp1.png',
      status: 'approved'
    });

    const p4 = await Product.create({
      farmer: farmer2._id,
      name: 'Black Tiger Prawns',
      quantity: 300,
      piecesPerKg: '15-20',
      expectedPrice: 700,
      finalPrice: 680,
      image: '/images/prawn1.png',
      status: 'approved'
    });

    await Product.create({
      farmer: farmer3._id,
      name: 'Indian White Prawn',
      quantity: 800,
      piecesPerKg: '25-30',
      expectedPrice: 500,
      image: '/images/shrimp1.png',
      status: 'pending'
    });

    const p6 = await Product.create({
      farmer: farmer3._id,
      name: 'Fresh Scampi',
      quantity: 150,
      piecesPerKg: '8-12',
      expectedPrice: 950,
      finalPrice: 900,
      image: '/images/prawn1.png',
      status: 'approved'
    });

    await Product.create({
      farmer: farmer4._id,
      name: 'Blue Crab',
      quantity: 100,
      piecesPerKg: '3-5',
      expectedPrice: 1200,
      status: 'pending'
    });

    await Product.create({
      farmer: farmer4._id,
      name: 'Mud Crab',
      quantity: 50,
      piecesPerKg: '1-2',
      expectedPrice: 1500,
      status: 'negotiating'
    });

    // --- CREATE ORDERS ---
    await Order.create({
      buyer: buyer1._id,
      product: p3._id,
      quantity: 500,
      totalAmount: 500 * 340,
      status: 'pending_verification',
      paymentStatus: 'pending'
    });

    await Order.create({
      buyer: buyer1._id,
      product: p4._id,
      quantity: 300,
      totalAmount: 300 * 680,
      status: 'confirmed',
      paymentStatus: 'partial_paid'
    });

    await Order.create({
      buyer: buyer2._id,
      product: p6._id,
      quantity: 150,
      totalAmount: 150 * 900,
      status: 'completed',
      paymentStatus: 'paid'
    });

    await Order.create({
      buyer: buyer3._id,
      product: p4._id, // Multiple buyers can theoretically buy different batches of same product type (assuming farmer restocked)
      quantity: 100,
      totalAmount: 100 * 680,
      status: 'pending_verification',
      paymentStatus: 'pending'
    });

    console.log('Massive dummy data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
