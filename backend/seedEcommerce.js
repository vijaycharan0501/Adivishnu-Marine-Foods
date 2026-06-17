const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const seedEcommerceData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adivishnu');
    console.log('MongoDB Connected for seeding ecommerce data...');

    const products = [
      {
        name: 'Live Oysters (Dozen)',
        category: 'Shellfish',
        quantity: 1,
        piecesPerKg: 'N/A',
        expectedPrice: 1200,
        finalPrice: 1200,
        stock: 200,
        ecommerceStatus: 'published',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1598004505167-937b82f09908?w=500&q=80'
      },
      {
        name: 'Fresh Whole Squid',
        category: 'Cephalopod',
        quantity: 1,
        piecesPerKg: 'N/A',
        expectedPrice: 400,
        finalPrice: 400,
        stock: 80,
        ecommerceStatus: 'published',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1588665799981-d41a76f2f9f1?w=500&q=80'
      },
      {
        name: 'Swordfish Steaks',
        category: 'Fish',
        quantity: 1,
        piecesPerKg: 'N/A',
        expectedPrice: 1100,
        finalPrice: 1100,
        stock: 20,
        ecommerceStatus: 'draft',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1599557675123-6cf7cf7b3127?w=500&q=80'
      },
      {
        name: 'Wild Red Snapper',
        category: 'Fish',
        quantity: 1,
        piecesPerKg: 'N/A',
        expectedPrice: 650,
        finalPrice: 650,
        stock: 60,
        ecommerceStatus: 'published',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1519999642646-5e05445fc6dc?w=500&q=80'
      },
      {
        name: 'Fresh Octopus',
        category: 'Cephalopod',
        quantity: 1,
        piecesPerKg: 'N/A',
        expectedPrice: 900,
        finalPrice: 900,
        stock: 0,
        ecommerceStatus: 'out_of_stock',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&q=80' // re-using a good octopus/squid vibe or similar
      }
    ];

    for (const p of products) {
      await Product.create(p);
    }

    console.log('Ecommerce dummy products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedEcommerceData();
