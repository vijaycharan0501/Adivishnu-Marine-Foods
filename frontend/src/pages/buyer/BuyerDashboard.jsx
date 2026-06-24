import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../../features/products/productSlice';
import { getOrders, createOrder } from '../../features/orders/orderSlice';
import { getInquiries, createInquiry } from '../../features/inquiries/inquirySlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Truck, IndianRupee } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders);
  const { inquiries } = useSelector((state) => state.inquiry);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orderQuantities, setOrderQuantities] = useState({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactForm, setContactForm] = useState({ 
    fullName: '', 
    phone: '', 
    address1: '', 
    address2: '', 
    city: '', 
    state: '', 
    zip: '', 
    country: 'India' 
  });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ productName: '', estimatedQuantity: '', message: '' });
  const [activeTab, setActiveTab] = useState('orders');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState('');
  const dateInputRef = useRef(null);

  const handleQuantityChange = (productId, qty) => {
    setOrderQuantities(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      dispatch(getOrders());
      dispatch(getInquiries());

      const newSocket = io('http://localhost:5000');
      newSocket.on('ecommerce_product_updated', () => {
        dispatch(getProducts());
      });
      newSocket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.buyer === user._id) {
          toast.success(`Order status updated to ${updatedOrder.status}`);
          dispatch(getOrders());
        }
      });
      return () => newSocket.close();
    }
  }, [user, navigate, dispatch]);

  const handleOpenContactModal = (product) => {
    const qty = orderQuantities[product._id] || 1;
    if (product.ecommerceStatus === 'out_of_stock' || product.stock <= 0) {
      alert('This product is currently out of stock.');
      return;
    }
    if (qty > product.stock) {
      alert(`Only ${product.stock} Kgs available in stock.`);
      return;
    }
    setSelectedProduct(product);
    setIsContactModalOpen(true);
  };

  const confirmOrder = (e) => {
    e.preventDefault();
    const qty = orderQuantities[selectedProduct._id] || 1;
    const fullAddress = [
      contactForm.address1,
      contactForm.address2,
      contactForm.city,
      contactForm.state,
      contactForm.zip,
      contactForm.country
    ].filter(Boolean).join(', ');

    const orderData = {
      product: selectedProduct._id,
      quantity: qty, 
      totalAmount: qty * (selectedProduct.finalPrice || selectedProduct.expectedPrice),
      contactDetails: {
        name: contactForm.fullName,
        phone: contactForm.phone,
        location: fullAddress
      }
    };
    dispatch(createOrder(orderData));
    setIsContactModalOpen(false);
    setSelectedProduct(null);
    setContactForm({ fullName: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: 'India' });
    setIsSuccessModalOpen(true);
  };

  const handleCreateInquiry = (e) => {
    e.preventDefault();
    dispatch(createInquiry(inquiryForm));
    setIsInquiryModalOpen(false);
    setInquiryForm({ productName: '', estimatedQuantity: '', message: '' });
    toast.success('Custom request sent to the company successfully!');
  };

  const availableProducts = products.filter(p => p.ecommerceStatus === 'published' || p.ecommerceStatus === 'out_of_stock');
  const myOrders = orders;
  const totalSpent = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredOrders = orders.filter(order => {
    if (!orderFilter) return true;
    if (!order.createdAt) return false;
    
    const orderDate = new Date(order.createdAt);
    const orderYear = orderDate.getFullYear();
    const orderMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
    const orderDay = String(orderDate.getDate()).padStart(2, '0');
    const orderDateString = `${orderYear}-${orderMonth}-${orderDay}`;
    
    return orderDateString === orderFilter;
  });

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
        <img src="/images/buyer_bg.png" alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f4f7fb]/70 to-[#f4f7fb]"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-ocean-600 to-blue-500 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-10 flex items-center h-[180px]"
        >
          <div className="absolute inset-0 w-full h-full">
            <img src="/images/buyer_bg.png" alt="Dashboard Background" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
          </div>
          <div className="relative z-10 p-10 flex-1">
             <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome to the Marketplace, {user?.name}!</h2>
             <p className="text-blue-50 font-medium text-[16px] max-w-2xl">Discover and purchase premium seafood directly from trusted contractors and track your shipments seamlessly.</p>
          </div>
          <div className="relative z-10 pr-10">
            <button onClick={() => setIsInquiryModalOpen(true)} className="bg-white text-ocean-700 px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg transform hover:scale-105 active:scale-95">
              + Request Custom Product
            </button>
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
              <Package className="w-8 h-8 text-blue-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Available Deals</p>
              <p className="text-3xl font-extrabold text-blue-600 leading-none">{availableProducts.length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-8 h-8 text-green-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">My Orders</p>
              <p className="text-3xl font-extrabold text-green-600 leading-none">{myOrders.length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Truck className="w-8 h-8 text-orange-500" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Pending Delivery</p>
              <p className="text-3xl font-extrabold text-orange-500 leading-none">{orders.filter(o => o.status !== 'completed').length}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden transition-all">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <IndianRupee className="w-8 h-8 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Spent</p>
              <p className="text-3xl font-extrabold text-purple-600 leading-none">₹{totalSpent.toLocaleString()}</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-4">Available Products Marketplace</h2>
          
          {productsLoading ? (
            <p className="text-slate-500">Loading marketplace...</p>
          ) : availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableProducts.map(product => (
                <div key={product._id} className="card hover:shadow-md transition-shadow">
                  {product.image ? (
                    <div className="h-48 rounded-lg mb-4 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{product.category || 'General Seafood'}</p>
                  
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Available Stock</p>
                      <p className={`font-medium ${product.stock > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} Kgs` : 'Out of Stock'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Price per Kg</p>
                      <p className="text-xl font-bold text-ocean-600">₹{product.finalPrice || product.expectedPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="number" 
                      min="1" 
                      max={product.stock > 0 ? product.stock : 1}
                      value={orderQuantities[product._id] || 1} 
                      onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                      disabled={product.ecommerceStatus === 'out_of_stock' || product.stock <= 0}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center outline-none focus:ring-1 focus:ring-ocean-500"
                    />
                    <button 
                      onClick={() => handleOpenContactModal(product)} 
                      disabled={product.ecommerceStatus === 'out_of_stock' || product.stock <= 0}
                      className={`flex-1 flex items-center justify-center gap-2 ${product.ecommerceStatus === 'out_of_stock' || product.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed py-2 rounded-lg' : 'btn-primary'}`}>
                      <ShoppingCart className="h-4 w-4" /> {product.ecommerceStatus === 'out_of_stock' || product.stock <= 0 ? 'Out of Stock' : 'Place Order'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-slate-500">No products are currently available in the marketplace.</p>
            </div>
          )}
        </motion.div>

        <div className="flex justify-center mt-12 mb-8">
          <div className="inline-flex h-16 p-1.5 rounded-full bg-[#0A0F1C] border border-white/10 relative shadow-2xl backdrop-blur-md">
            
            {/* Sliding Active Pill Background */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-56 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-transform duration-300 ease-out z-0 ${
                activeTab === 'orders' ? 'translate-x-0' : 'translate-x-56'
              }`} 
            />

            <button
              onClick={() => setActiveTab('orders')}
              className={`relative z-10 flex w-56 h-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none ${
                activeTab === 'orders' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
              }`}
            >
              <span className="text-lg">📦</span> 
              <span>My Orders</span>
              {orders && orders.length > 0 && (
                <span className={`ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-inner transition-colors duration-300 ${
                  activeTab === 'orders' ? 'bg-white text-blue-600' : 'bg-gray-800 text-gray-400 border border-white/10'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`relative z-10 flex w-56 h-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none ${
                activeTab === 'requests' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
              }`}
            >
              <span className="text-lg">📝</span> 
              <span>My Custom Requests</span>
              {inquiries && inquiries.length > 0 && (
                <span className={`ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-inner transition-colors duration-300 ${
                  activeTab === 'requests' ? 'bg-white text-blue-600' : 'bg-gray-800 text-gray-400 border border-white/10'
                }`}>
                  {inquiries.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
              <div className="flex items-center gap-3">
              {orderFilter && (
                <button 
                  onClick={() => setOrderFilter('')} 
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear Filter
                </button>
              )}
              <div 
                className="relative inline-block cursor-pointer"
                onClick={() => {
                  try { dateInputRef.current?.showPicker(); } catch { /* ignore fallback */ }
                }}
              >
                <div className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-slate-600 gap-2 transition-colors px-4 py-2 h-[38px] min-w-[100px] pointer-events-none">
                  {orderFilter ? (
                    <span className="text-sm font-medium text-slate-800">
                      {new Date(orderFilter + 'T12:00:00Z').toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ pointerEvents: 'none' }}
                  title="Select Date"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 font-semibold text-slate-600">Order ID</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Quantity</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Total Amount</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Payment</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="7">Loading orders...</td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-mono text-sm text-slate-500">{order._id.substring(0, 8)}...</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{order.product?.name || 'Product'}</td>
                      <td className="py-4 px-4 text-slate-600">{order.quantity} Kg</td>
                      <td className="py-4 px-4 text-slate-600">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                         <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === 'pending' ? 'bg-gray-100 text-gray-800' :
                          order.paymentStatus === 'partial_paid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/invoice/order/${order._id}`} className="text-ocean-600 font-medium hover:text-ocean-700 text-sm">Invoice</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="7">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        )}

        {/* My Inquiries Section */}
        {activeTab === 'requests' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-4">My Custom Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-slate-500">
                  <th className="py-3 px-4 font-semibold">Requested Item</th>
                  <th className="py-3 px-4 font-semibold">Est. Qty</th>
                  <th className="py-3 px-4 font-semibold">Message</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Admin Reply</th>
                </tr>
              </thead>
              <tbody>
                {inquiries && inquiries.length > 0 ? (
                  inquiries.map((inq) => (
                    <tr key={inq._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-800">{inq.productName}</td>
                      <td className="py-4 px-4 text-slate-600">{inq.estimatedQuantity}</td>
                      <td className="py-4 px-4 text-slate-600 truncate max-w-xs">{inq.message}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : inq.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {inq.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 italic">
                        {inq.adminReply ? inq.adminReply : "Awaiting response..."}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="5">You haven't made any custom requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        )}
      </div>

      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-3xl overflow-hidden border border-gray-200"
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Address Information</h3>
                <p className="text-sm text-slate-500 mt-1">Please enter your delivery details for this order.</p>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={confirmOrder} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={contactForm.fullName} onChange={(e) => setContactForm({...contactForm, fullName: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" required value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                  <input type="text" required value={contactForm.address1} onChange={(e) => setContactForm({...contactForm, address1: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="123 Main St" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="text" value={contactForm.address2} onChange={(e) => setContactForm({...contactForm, address2: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Apartment, suite, etc." />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input type="text" required value={contactForm.city} onChange={(e) => setContactForm({...contactForm, city: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="City" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">State / Province <span className="text-red-500">*</span></label>
                  <input type="text" required value={contactForm.state} onChange={(e) => setContactForm({...contactForm, state: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="State" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                  <input type="text" required value={contactForm.zip} onChange={(e) => setContactForm({...contactForm, zip: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="ZIP / Postal Code" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <select required value={contactForm.country} onChange={(e) => setContactForm({...contactForm, country: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white appearance-none">
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg shadow-sm shadow-blue-500/30 transition-all hover:shadow-blue-500/50">
                  Save Address & Order
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-slate-800">Request Custom Product</h3>
              <button onClick={() => setIsInquiryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateInquiry} className="p-6">
              <p className="text-sm text-slate-500 mb-4">Need something specific that isn't listed? Send a direct request to our procurement team.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name / Type</label>
                  <input type="text" placeholder="e.g. King Crabs" required value={inquiryForm.productName} onChange={(e) => setInquiryForm({...inquiryForm, productName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Quantity Needed</label>
                  <input type="text" placeholder="e.g. 500 Kgs / 1 Ton" required value={inquiryForm.estimatedQuantity} onChange={(e) => setInquiryForm({...inquiryForm, estimatedQuantity: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specific Requirements / Message</label>
                  <textarea rows="4" placeholder="Any size requirements, delivery timelines, etc." required value={inquiryForm.message} onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInquiryModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-medium transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md overflow-hidden border border-gray-100 text-center p-8"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Order Successful!</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your order has been placed successfully. Our employee will contact with you in the next 24hrs for order conformation.
            </p>
            <button 
              onClick={() => setIsSuccessModalOpen(false)} 
              className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Continue Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
