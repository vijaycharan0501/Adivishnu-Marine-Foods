const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');

// @desc    Initiate or get negotiation for a product
// @route   POST /api/negotiations
// @access  Private
const startNegotiation = async (req, res) => {
  try {
    const { productId } = req.body;
    
    let negotiation = await Negotiation.findOne({ product: productId });
    
    if (!negotiation) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      
      negotiation = new Negotiation({
        product: productId,
        farmer: product.farmer,
        history: [{
          offeredBy: 'farmer',
          price: product.expectedPrice
        }]
      });
      await negotiation.save();
    }
    
    res.status(201).json(negotiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add offer to negotiation
// @route   POST /api/negotiations/:id/offer
// @access  Private
const addOffer = async (req, res) => {
  try {
    const { price } = req.body;
    const negotiationId = req.params.id;
    
    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' });

    const role = req.user.role; // 'farmer' or 'admin'
    
    negotiation.history.push({
      offeredBy: role,
      price: price
    });
    
    if (role === 'admin' && !negotiation.admin) {
      negotiation.admin = req.user._id;
    }

    await negotiation.save();
    
    // Update product status to negotiating if it was pending
    const product = await Product.findById(negotiation.product);
    if (product && product.status === 'pending') {
      product.status = 'negotiating';
      await product.save();
    }

    // Emit socket event to the room
    const io = req.app.get('io');
    io.to(negotiationId).emit('new_offer', negotiation);
    
    // Emit global event for dashboard notifications
    io.emit('receive_offer', {
      senderRole: role,
      negotiationId: negotiationId
    });

    res.json(negotiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept/Reject negotiation
// @route   PUT /api/negotiations/:id/status
// @access  Private
const updateNegotiationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const negotiationId = req.params.id;
    
    const negotiation = await Negotiation.findById(negotiationId).populate('product');
    if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' });

    negotiation.status = status;
    await negotiation.save();
    
    if (status === 'accepted') {
      // Update product status
      const lastOffer = negotiation.history[negotiation.history.length - 1];
      await Product.findByIdAndUpdate(negotiation.product._id, {
        status: 'approved',
        finalPrice: lastOffer.price
      });
    } else if (status === 'rejected') {
      await Product.findByIdAndUpdate(negotiation.product._id, {
        status: 'rejected'
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(negotiationId).emit('negotiation_status_update', negotiation);

    res.json(negotiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add contact details to negotiation
// @route   PUT /api/negotiations/:id/contact
// @access  Private
const updateContactDetails = async (req, res) => {
  try {
    const { contactDetails } = req.body;
    const negotiationId = req.params.id;
    
    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' });

    negotiation.contactDetails = contactDetails;
    await negotiation.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(negotiationId).emit('negotiation_status_update', negotiation);

    res.json(negotiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startNegotiation, addOffer, updateNegotiationStatus, updateContactDetails };
