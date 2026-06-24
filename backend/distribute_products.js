const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const distributeProducts = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/adivishnu');
    
    const contractors = await User.find({ role: 'farmer' });
    const products = await Product.find({});
    
    if (contractors.length === 0 || products.length === 0) {
      console.log('No contractors or products found to distribute.');
      process.exit(0);
    }

    let updates = 0;
    for (let i = 0; i < products.length; i++) {
      // Round robin assignment
      const contractorIndex = i % contractors.length;
      const contractor = contractors[contractorIndex];
      
      products[i].farmer = contractor._id;
      await products[i].save();
      updates++;
    }

    console.log(`Successfully distributed ${updates} products among ${contractors.length} contractors!`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error distributing products:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

distributeProducts();
