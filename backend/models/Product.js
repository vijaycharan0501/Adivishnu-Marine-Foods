const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for Admin created products
  name: { type: String, required: true }, // e.g., Vannamei Shrimp
  category: { type: String, default: 'General Seafood' },
  quantity: { type: Number, required: true }, // In KG (for Farmer context)
  piecesPerKg: { type: String, required: true }, // e.g., '20-25'
  expectedPrice: { type: Number, required: true }, // Per KG
  image: { type: String }, // Cloudinary URL or local path
  status: { type: String, enum: ['pending', 'negotiating', 'approved', 'sold', 'rejected'], default: 'pending' },
  finalPrice: { type: Number },
  
  // Ecommerce specific fields
  stock: { type: Number, default: 0 }, // Available stock for retail buyers
  ecommerceStatus: { type: String, enum: ['draft', 'published', 'out_of_stock', 'archived'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
