import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../../features/products/productSlice';
import { getOrders, createOrder } from '../../features/orders/orderSlice';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orderQuantities, setOrderQuantities] = useState({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', location: '' });

  const handleQuantityChange = (productId, qty) => {
    setOrderQuantities(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      dispatch(getOrders());

      const newSocket = io('http://localhost:5000');
      newSocket.on('ecommerce_product_updated', () => {
        dispatch(getProducts());
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
    const orderData = {
      product: selectedProduct._id,
      quantity: qty, 
      totalAmount: qty * (selectedProduct.finalPrice || selectedProduct.expectedPrice),
      contactDetails: contactForm
    };
    dispatch(createOrder(orderData)).then(() => {
      alert('Order placed successfully!');
      setIsContactModalOpen(false);
      setSelectedProduct(null);
      setContactForm({ name: '', phone: '', location: '' });
      dispatch(getOrders());
    });
  };

  const availableProducts = products.filter(p => p.ecommerceStatus === 'published' || p.ecommerceStatus === 'out_of_stock');
  const myOrders = orders;
  const totalSpent = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Buyer Dashboard</h1>
          <p className="text-lg text-slate-600 mt-1">Welcome back, {user?.name}!</p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Available Deals</h3>
            <p className="text-3xl font-bold text-ocean-600">{availableProducts.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">My Orders</h3>
            <p className="text-3xl font-bold text-ocean-600">{myOrders.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Pending Delivery</h3>
            <p className="text-3xl font-bold text-ocean-600">{orders.filter(o => o.status !== 'completed').length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-ocean-600">₹{totalSpent.toLocaleString()}</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Products Marketplace</h2>
          
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

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
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
                ) : orders.length > 0 ? (
                  orders.map(order => (
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
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="7">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-slate-800">Provide Delivery Details</h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={confirmOrder} className="p-6">
              <p className="text-sm text-slate-500 mb-4">Please provide your contact details so the admin can contact you to fulfill the order.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" required value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Location</label>
                  <input type="text" required value={contactForm.location} onChange={(e) => setContactForm({...contactForm, location: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-medium transition-colors">Confirm Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
