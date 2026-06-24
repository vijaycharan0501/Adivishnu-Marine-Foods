const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  estimatedQuantity: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  adminReply: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
