const mongoose = require('mongoose');

const procurementRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'General Seafood' },
  targetQuantity: { type: Number, required: true }, // In KG
  expectedPricePerKg: { type: Number, required: true },
  status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Specific contractors this is visible to
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Legacy, keep for old records
  acceptedBy: [{
    contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryTimeDays: { type: Number },
    linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    date: { type: Date, default: Date.now }
  }],
  linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Legacy
  deliveryTimeDays: { type: Number }, // Legacy
  rejections: [{
    contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ProcurementRequest', procurementRequestSchema);
