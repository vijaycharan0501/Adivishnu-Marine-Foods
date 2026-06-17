const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const seedFarmersData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adivishnu');
    console.log('MongoDB Connected for seeding farmer data...');

    // Create Dummy Farmers
    const farmers = [
      {
        name: 'John Smith',
        companyName: 'Aqua Farms Ltd',
        email: 'john.aqua@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '9876543210'
      },
      {
        name: 'Sarah Connor',
        companyName: 'Coastal Fisheries',
        email: 'sarah.coastal@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '8765432109'
      },
      {
        name: 'Mike Davis',
        companyName: 'Deep Blue Harvesters',
        email: 'mike.deepblue@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '7654321098'
      }
    ];

    const createdFarmers = [];
    for (const farmer of farmers) {
      // check if exists to avoid email conflict
      let existingUser = await User.findOne({ email: farmer.email });
      if (!existingUser) {
        existingUser = await User.create(farmer);
      }
      createdFarmers.push(existingUser);
    }

    const aquaId = createdFarmers[0]._id;
    const coastalId = createdFarmers[1]._id;
    const deepBlueId = createdFarmers[2]._id;

    // Create Products
    const products = [
      {
        farmer: aquaId,
        name: 'Vannamei White Shrimp (Premium)',
        category: 'Shrimp',
        quantity: 500,
        piecesPerKg: '30-40',
        expectedPrice: 400,
        status: 'pending'
      },
      {
        farmer: aquaId,
        name: 'Black Tiger Prawns',
        category: 'Prawns',
        quantity: 200,
        piecesPerKg: '15-20',
        expectedPrice: 650,
        status: 'pending'
      },
      {
        farmer: aquaId,
        name: 'Scampi (Freshwater)',
        category: 'Prawns',
        quantity: 150,
        piecesPerKg: '10-15',
        expectedPrice: 800,
        status: 'approved'
      },
      {
        farmer: coastalId,
        name: 'Giant Mud Crab',
        category: 'Crab',
        quantity: 100,
        piecesPerKg: '1-2',
        expectedPrice: 1200,
        status: 'negotiating'
      },
      {
        farmer: coastalId,
        name: 'Blue Swimmer Crab',
        category: 'Crab',
        quantity: 300,
        piecesPerKg: '4-6',
        expectedPrice: 450,
        status: 'rejected'
      },
      {
        farmer: deepBlueId,
        name: 'Silver Pomfret',
        category: 'Fish',
        quantity: 1000,
        piecesPerKg: '3-4',
        expectedPrice: 850,
        status: 'pending'
      },
      {
        farmer: deepBlueId,
        name: 'King Mackerel',
        category: 'Fish',
        quantity: 800,
        piecesPerKg: '1',
        expectedPrice: 600,
        status: 'approved'
      }
    ];

    for (const p of products) {
      await Product.create(p);
    }

    console.log('Farmer dummy data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedFarmersData();
