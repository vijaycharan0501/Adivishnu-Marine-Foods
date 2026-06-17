const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending_verification', 'confirmed', 'completed'], default: 'pending_verification' },
  paymentStatus: { type: String, enum: ['pending', 'partial_paid', 'paid'], default: 'pending' },
  advanceAmountPaid: { type: Number, default: 0 },
  contactDetails: {
    name: { type: String },
    phone: { type: String },
    location: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
