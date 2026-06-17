const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const removeRecentProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adivishnu');
    console.log('MongoDB Connected for removing products...');

    const productsToRemove = [
      'Live Oysters (Dozen)',
      'Fresh Whole Squid',
      'Swordfish Steaks',
      'Wild Red Snapper',
      'Fresh Octopus'
    ];

    const result = await Product.deleteMany({ name: { $in: productsToRemove } });

    console.log(`Successfully removed ${result.deletedCount} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error removing data:', error);
    process.exit(1);
  }
};

removeRecentProducts();
