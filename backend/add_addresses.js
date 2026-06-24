const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const FAKE_ADDRESSES = [
  '12A, Marine Drive, Mumbai, Maharashtra 400020',
  '45, Fisherman Cove, Chennai, Tamil Nadu 600004',
  'Plot 88, Coastal Road, Kochi, Kerala 682001',
  'Sector 5, Harbor View, Visakhapatnam, Andhra Pradesh 530003',
  'Beach Road, Mangalore, Karnataka 575001',
  '19, Port Street, Paradip, Odisha 754142',
  'Seaface Villa, Porbandar, Gujarat 360575',
  'Dockyard Lane, Kolkata, West Bengal 700043',
  'Ocean View, Goa 403001',
  'Bay Street, Kanyakumari, Tamil Nadu 629702'
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB');
  
  const contractors = await User.find({ role: 'farmer' });
  console.log(`Found ${contractors.length} contractors. Adding fake addresses...`);

  for (let i = 0; i < contractors.length; i++) {
    contractors[i].address = FAKE_ADDRESSES[i % FAKE_ADDRESSES.length];
    await contractors[i].save();
    console.log(`Updated ${contractors[i].name} with address: ${contractors[i].address}`);
  }

  console.log('Done!');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
