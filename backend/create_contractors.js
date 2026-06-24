const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createContractors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Delete existing farmers
    await User.deleteMany({ role: 'farmer' });

    const contractors = [];
    const password = await bcrypt.hash('contractor123', 10);
    
    const contractorNames = [
      "Ramesh Reddy",
      "Suresh Kumar",
      "Venkatesh Rao",
      "Anjali Desai",
      "Karthik Sharma",
      "Meena Iyer",
      "Prakash Verma",
      "Lakshmi Narayan",
      "Rajesh Khanna",
      "Vikram Singh"
    ];

    for (let i = 1; i <= 10; i++) {
      contractors.push({
        name: contractorNames[i - 1],
        email: `contractor${i}@adivishnu.com`,
        password: password,
        phone: `987654321${i-1}`,
        role: 'farmer'
      });
    }

    await User.insertMany(contractors);

    console.log('Successfully created 10 official contractor accounts with real names!');
    console.log('Login Details:');
    contractors.forEach((c) => {
      console.log(`${c.name} - Email: ${c.email} | Password: contractor123`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createContractors();
