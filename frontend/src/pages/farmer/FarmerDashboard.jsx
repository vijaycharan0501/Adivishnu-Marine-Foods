import { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getProducts } from '../../features/products/productSlice';
import { getProcurements, fulfillProcurement, rejectProcurement } from '../../features/procurements/procurementSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, CheckCircle2, XCircle, Info, FileText, Activity, Package } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useSelector((state) => state.auth) || {};
  const { products, isLoading } = useSelector((state) => state.products) || {};
  const { procurements } = useSelector((state) => state.procurement) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeProcurements = useMemo(() => Array.isArray(procurements) ? procurements : [], [procurements]);

  const [localRejectedRequests, setLocalRejectedRequests] = useState([]);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);
  const [fulfillForm, setFulfillForm] = useState({ deliveryTimeDays: '' });
  const [rejectReason, setRejectReason] = useState('');
  
  const [viewedItems, setViewedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('viewedItems_' + user?._id) || '[]'); } catch { return []; }
  });
  const [dateFilter, setDateFilter] = useState('');
  const dateInputRef = useRef(null);

  const markAsViewed = (item) => {
    const key = item._id + '_' + item.updatedAt;
    if (!viewedItems.includes(key)) {
      const newViewed = [...viewedItems, key];
      setViewedItems(newViewed);
      localStorage.setItem('viewedItems_' + user?._id, JSON.stringify(newViewed));
    }
  };


  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      dispatch(getProcurements());
      
      const newSocket = io('http://localhost:5000');

      
      newSocket.on('receive_offer', (data) => {
        if (data.senderRole !== 'farmer') {
          toast.success(`New counter-offer received for your product!`);
        }
      });
      
      newSocket.on('status_update', (data) => {
        toast.success(`Product status updated to ${data.status}`);
        dispatch(getProducts()); // Refresh list to get updated status
      });

      return () => newSocket.close();
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const dbRejected = useMemo(() => {
    if (!user) return [];
    return safeProcurements
      .filter(p => p.rejections?.some(r => r.contractor === user._id || r.contractor?._id === user._id))
      .map(p => p._id);
  }, [safeProcurements, user]);

  const rejectedRequests = useMemo(() => {
    return [...new Set([...localRejectedRequests, ...dbRejected])];
  }, [localRejectedRequests, dbRejected]);

  const acceptedRequests = safeProcurements
    .filter(p => p.acceptedBy?.some(a => a.contractor === user._id || a.contractor?._id === user._id) || p.fulfilledBy === user._id)
    .map(p => p._id);

  const pendingProducts = safeProducts.filter(p => p && (p.status === 'pending' || p.status === 'negotiating'));
  const approvedProducts = safeProducts.filter(p => p && (p.status === 'approved' || p.status === 'sold'));
  const totalQuantity = safeProducts.reduce((acc, curr) => acc + (curr?.quantity || 0), 0);

  const filteredProducts = safeProducts.filter(p => {
    if (!dateFilter) return true;
    if (!p.updatedAt) return false;
    const pDate = new Date(p.updatedAt);
    const pDateString = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
    return pDateString === dateFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    return new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0);
  });

  const sortedProcurements = [...safeProcurements].sort((a, b) => {
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });

  const handleOpenFulfillModal = (proc) => {
    markAsViewed(proc);
    setSelectedProcurement(proc);
    setFulfillForm({ deliveryTimeDays: '' });
    setIsFulfillModalOpen(true);
  };

  const handleOpenInfoModal = (proc) => {
    markAsViewed(proc);
    setSelectedProcurement(proc);
    setIsInfoModalOpen(true);
  };

  const handleRejectClick = (proc) => {
    markAsViewed(proc);
    setSelectedProcurement(proc);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const submitReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    dispatch(rejectProcurement({ id: selectedProcurement._id, reason: rejectReason })).then(() => {
      setLocalRejectedRequests(prev => [...prev, selectedProcurement._id]);
      setIsRejectModalOpen(false);
      toast.success(`Request rejected. Reason: ${rejectReason}`);
    });
  };

  const submitFulfillment = (e) => {
    e.preventDefault();
    dispatch(fulfillProcurement({
      id: selectedProcurement._id,
      data: {
        deliveryTimeDays: Number(fulfillForm.deliveryTimeDays)
      }
    })).then(() => {
      toast.success('Fulfillment submitted! You can now track it in your listings.');
      setIsFulfillModalOpen(false);
      dispatch(getProducts());
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative bg-[#f4f7fb] p-8 overflow-hidden">
      {/* Global Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/images/contractor_bg.png" alt="" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f4f7fb]/60 to-[#f4f7fb]"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-ocean-800 to-blue-800 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-10 flex items-center h-[180px]"
        >
          <div className="relative z-10 p-10 flex-1">
             <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome aboard, {user?.name}!</h2>
             <p className="text-blue-100 font-medium text-[16px] max-w-2xl">Manage your seafood offers, negotiate deals, and fulfill company requirements directly from your dashboard.</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}>
             <img src="/images/contractor_side_art.png" alt="Dashboard Illustration" className="w-full h-full object-cover opacity-90 transform scale-105" />
          </div>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-blue-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Offers</p>
              <p className="text-3xl font-extrabold text-blue-600 leading-none">{safeProducts.length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Activity className="w-8 h-8 text-orange-500" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Active Negotiations</p>
              <p className="text-3xl font-extrabold text-orange-500 leading-none">{pendingProducts.length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Approved Deals</p>
              <p className="text-3xl font-extrabold text-green-600 leading-none">{approvedProducts.length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Package className="w-8 h-8 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Volume</p>
              <p className="text-3xl font-extrabold text-purple-600 leading-none">{totalQuantity} <span className="text-lg">Kg</span></p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8 scroll-mt-24 mb-10 relative z-20"
          id="offers"
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Offers</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {dateFilter && (
                  <button onClick={() => setDateFilter('')} className="text-sm text-blue-600 hover:underline font-medium">Clear Filter</button>
                )}
                <div 
                  className="relative inline-block cursor-pointer"
                  onClick={() => {
                    try { dateInputRef.current?.showPicker(); } catch { /* ignore fallback */ }
                  }}
                >
                  <div className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-slate-600 gap-2 transition-colors px-4 py-2 h-[38px] min-w-[100px] pointer-events-none">
                    {dateFilter ? (
                      <span className="text-sm font-medium text-slate-800">
                        {new Date(dateFilter + 'T12:00:00Z').toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        <span className="text-sm font-medium">Filter</span>
                      </>
                    )}
                  </div>
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ pointerEvents: 'none' }}
                    title="Select Date"
                  />
                </div>
              </div>
              <Link to="/farmer/add-product" className="btn-primary">Add New Product</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Quantity</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Pieces/Kg</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Expected Price (₹/Kg)</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="6">Loading products...</td>
                  </tr>
                ) : sortedProducts.length > 0 ? (
                  sortedProducts.map((product, index) => product && (
                    <tr key={product._id || `farmer_prod_${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-slate-800 relative">
                        {product.name}
                        {product.status === 'negotiating' && !viewedItems.includes(product._id + '_' + product.updatedAt) && (
                          <span className="absolute top-1/2 -translate-y-1/2 -left-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600">{product.quantity} Kg</td>
                      <td className="py-4 px-4 text-slate-600">{product.piecesPerKg}</td>
                      <td className="py-4 px-4 text-slate-600">{product.expectedPrice}</td>
                      <td className="py-4 px-4">
                        <span className={`relative px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          product.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                          product.status === 'approved' ? 'bg-green-100 text-green-800' :
                          product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {product.status === 'pending' || product.status === 'negotiating' ? (
                          <Link onClick={() => markAsViewed(product)} to={`/negotiation/${product._id}`} className="text-ocean-600 font-medium hover:text-ocean-700">Review</Link>
                        ) : product.status === 'rejected' ? (
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-medium text-sm border border-red-200 bg-red-50 px-2 py-1 rounded">Declined</span>
                            <Link to={`/negotiation/${product._id}`} className="text-gray-400 hover:text-gray-600 transition-colors" title="View History">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Link to={`/invoice/product/${product._id}`} className="text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
                              Contract
                            </Link>
                            <Link to={`/negotiation/${product._id}`} className="text-gray-400 hover:text-gray-600 transition-colors" title="View History">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="5">No products listed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8 scroll-mt-24 relative z-20"
          id="requests"
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Company Requirements</h2>
            <Link to="/farmer/add-product" className="text-blue-600 hover:underline font-semibold text-sm">
              List new product to fulfill request
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-slate-500">
                  <th className="py-3 px-4 font-semibold">Requested Item</th>
                  <th className="py-3 px-4 font-semibold">Target Qty</th>
                  <th className="py-3 px-4 font-semibold">Expected Rate</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProcurements.length > 0 ? (
                  sortedProcurements.filter(p => !rejectedRequests.includes(p?._id) && !acceptedRequests.includes(p?._id)).map((proc, index) => proc && (
                    <tr key={proc._id || `farmer_proc_${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-800 relative">
                        {proc.title} 
                        {proc.status === 'open' && !viewedItems.includes(proc._id + '_' + proc.updatedAt) && (
                          <span className="absolute top-5 -left-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}
                        <span className="text-xs text-gray-500 block">{proc.category}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{proc.targetQuantity} kg</td>
                      <td className="py-4 px-4 text-slate-600">₹{proc.expectedPricePerKg}/kg</td>
                      <td className="py-4 px-4">
                        <span className={`relative px-3 py-1 rounded-full text-xs font-medium ${proc.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {proc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenInfoModal(proc)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors" title="View Full Details">
                            <Info className="w-6 h-6" />
                          </button>
                          {proc.status === 'open' ? (
                            <>
                              <button onClick={() => handleOpenFulfillModal(proc)} className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full transition-colors" title="Accept Offer">
                                <CheckCircle2 className="w-6 h-6" />
                              </button>
                              <button onClick={() => handleRejectClick(proc)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Reject Offer">
                                <XCircle className="w-6 h-6" />
                              </button>
                            </>
                          ) : proc.fulfilledBy === user._id ? (
                            <Link to={`/invoice/procurement/${proc._id}`} className="text-green-600 font-medium text-sm ml-2 hover:underline flex items-center gap-1" title="View Payment Receipt">
                              Receipt
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-sm ml-2">Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="5">No active company requests at the moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      {isFulfillModalOpen && selectedProcurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-ocean-50">
              <h3 className="text-lg font-bold text-ocean-800">Fulfill Company Request</h3>
              <button onClick={() => setIsFulfillModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitFulfillment} className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <p className="text-sm text-gray-600"><strong>Item:</strong> {selectedProcurement.title}</p>
                <p className="text-sm text-gray-600"><strong>Target Qty:</strong> {selectedProcurement.targetQuantity} kg</p>
                <p className="text-sm text-gray-600"><strong>Company's Expected Rate:</strong> ₹{selectedProcurement.expectedPricePerKg}/kg</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery Time (in Days)</label>
                  <input type="number" required min="1" placeholder="e.g. 5" value={fulfillForm.deliveryTimeDays} onChange={(e) => setFulfillForm({...fulfillForm, deliveryTimeDays: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFulfillModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-medium transition-colors">Submit Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && selectedProcurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" /> Contract Details
              </h3>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Requested Item</h4>
                  <p className="text-lg font-bold text-slate-800">{selectedProcurement.title}</p>
                  <p className="text-sm text-slate-600">{selectedProcurement.category}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Quantity</h4>
                    <p className="text-xl font-bold text-ocean-600">{selectedProcurement.targetQuantity} Kg</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Rate</h4>
                    <p className="text-xl font-bold text-green-600">₹{selectedProcurement.expectedPricePerKg}/kg</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Contract Value</h4>
                  <p className="text-xl font-bold text-slate-800">
                    ₹{(selectedProcurement.targetQuantity * selectedProcurement.expectedPricePerKg).toLocaleString()}
                  </p>
                </div>
                
                {selectedProcurement.status !== 'open' && (
                  <div className="mt-2 text-center">
                    <span className="text-sm font-medium text-slate-500">
                      Status: <span className="text-slate-800">{selectedProcurement.status.toUpperCase()}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInfoModalOpen(false)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedProcurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-800">Reject Request</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitReject} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Please provide a reason for rejecting the request for <strong>{selectedProcurement.title}</strong>:</p>
                <textarea 
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Out of stock, price too low..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">Submit Reason</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;
