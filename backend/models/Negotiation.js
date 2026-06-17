const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [
    {
      offeredBy: { type: String, enum: ['farmer', 'admin'], required: true },
      price: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['active', 'accepted', 'rejected'], default: 'active' },
  contactDetails: {
    name: { type: String },
    phone: { type: String },
    location: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Negotiation', negotiationSchema);
