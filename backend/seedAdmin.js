const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adivishnu')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@adivishnu.com' });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit();
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@adivishnu.com',
      password: 'password123',
      role: 'admin',
      phone: '1234567890'
    });

    await admin.save();
    console.log('Admin user created successfully.');
    console.log('Email: admin@adivishnu.com');
    console.log('Password: password123');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
