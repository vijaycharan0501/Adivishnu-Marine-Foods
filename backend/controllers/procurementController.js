const ProcurementRequest = require('../models/ProcurementRequest');
const Product = require('../models/Product');

// @desc    Get all procurement requests (Farmers see open, Admin sees all)
// @route   GET /api/procurements
// @access  Private
const getProcurements = async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin') {
      requests = await ProcurementRequest.find()
        .sort({ createdAt: -1 })
        .populate('fulfilledBy', 'name email companyName phone')
        .populate('assignedTo', 'name email companyName phone')
        .populate('rejections.contractor', 'name email companyName phone')
        .populate('acceptedBy.contractor', 'name email companyName phone');
    } else {
      // Farmers only see open requests assigned to them (or broadcasted to all), or ones they fulfilled
      requests = await ProcurementRequest.find({
        $or: [
          { 
            status: 'open',
            $or: [
              { assignedTo: { $size: 0 } },
              { assignedTo: { $exists: false } },
              { assignedTo: req.user._id }
            ]
          },
          { fulfilledBy: req.user._id },
          { "acceptedBy.contractor": req.user._id }
        ]
      }).sort({ createdAt: -1 }).populate('assignedTo', 'name email');
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a procurement request
// @route   POST /api/procurements
// @access  Private/Admin
const createProcurement = async (req, res) => {
  try {
    const { title, category, targetQuantity, expectedPricePerKg, assignedTo } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const assignedArray = assignedTo && assignedTo.length > 0 ? assignedTo : [];
    
    const procurement = await ProcurementRequest.create({
      title,
      category,
      targetQuantity,
      expectedPricePerKg,
      assignedTo: assignedArray,
      createdBy: req.user._id
    });

    res.status(201).json(procurement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update procurement request status
// @route   PUT /api/procurements/:id
// @access  Private/Admin
const updateProcurementStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const procurement = await ProcurementRequest.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    procurement.status = req.body.status || procurement.status;
    const updatedProcurement = await procurement.save();

    res.json(updatedProcurement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fulfill procurement request (Farmer)
// @route   POST /api/procurements/:id/fulfill
// @access  Private/Farmer
const fulfillProcurement = async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can fulfill requests' });
    }

    const procurement = await ProcurementRequest.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    if (procurement.status !== 'open') {
      return res.status(400).json({ message: 'This request is no longer open' });
    }

    const { deliveryTimeDays } = req.body;

    // Create a new product automatically linked to this request
    const product = await Product.create({
      farmer: req.user._id,
      name: procurement.title,
      category: procurement.category,
      quantity: procurement.targetQuantity,
      piecesPerKg: 'Standard', // Auto-filled for quick accept
      expectedPrice: procurement.expectedPricePerKg,
      status: 'pending' // Admin will see this as a regular product pending approval, but linked
    });

    // Instead of closing the request, we just add this contractor to acceptedBy
    procurement.acceptedBy.push({
      contractor: req.user._id,
      deliveryTimeDays,
      linkedProduct: product._id
    });
    
    // We do NOT change status to fulfilled, so other assigned contractors can still see it
    await procurement.save();

    res.json({ message: 'Request accepted successfully', procurement, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject procurement request (Farmer)
// @route   POST /api/procurements/:id/reject
// @access  Private/Farmer
const rejectProcurement = async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can reject requests' });
    }

    const procurement = await ProcurementRequest.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    const { reason } = req.body;
    
    // Check if already rejected
    const alreadyRejected = procurement.rejections.some(r => r.contractor.toString() === req.user._id.toString());
    if (!alreadyRejected) {
      procurement.rejections.push({
        contractor: req.user._id,
        reason: reason || 'No reason provided'
      });
      await procurement.save();
    }

    res.json(procurement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProcurements,
  createProcurement,
  updateProcurementStatus,
  fulfillProcurement,
  rejectProcurement
};
