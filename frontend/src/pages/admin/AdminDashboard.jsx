import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../features/products/productSlice';
import { getOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();



  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      dispatch(getOrders());
      
      const newSocket = io('http://localhost:5000');

      
      newSocket.on('receive_offer', (data) => {
        if (data.senderRole !== 'admin') {
          toast.success(`New bid received from a Farmer!`);
        }
      });
      
      return () => newSocket.close();
    }
  }, [user, navigate, dispatch]);

  const [activeTab, setActiveTab] = useState('farmer_conversations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', category: 'General Seafood', expectedPrice: '', stock: '', image: '', ecommerceStatus: 'draft' });

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({ id: product._id, name: product.name, category: product.category || 'General Seafood', expectedPrice: product.expectedPrice, stock: product.stock || 0, image: product.image || '', ecommerceStatus: product.ecommerceStatus || 'draft' });
    } else {
      setFormData({ id: null, name: '', category: 'General Seafood', expectedPrice: '', stock: '', image: '', ecommerceStatus: 'draft' });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      expectedPrice: Number(formData.expectedPrice),
      stock: Number(formData.stock),
      image: formData.image,
      ecommerceStatus: formData.ecommerceStatus,
      quantity: 1, 
      piecesPerKg: 'N/A' 
    };
    if (formData.id) {
      dispatch(updateAdminProduct({ id: formData.id, productData: payload }));
    } else {
      dispatch(createAdminProduct(payload));
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteAdminProduct(id));
    }
  };

  const handleQuickStatusChange = (product, newStatus) => {
    dispatch(updateAdminProduct({ id: product._id, productData: { ecommerceStatus: newStatus } }));
  };

  const handleQuickStockChange = (product, change) => {
    const newStock = Math.max(0, (product.stock || 0) + change);
    dispatch(updateAdminProduct({ id: product._id, productData: { stock: newStock } }));
  };

  const handleOrderUpdate = (orderId, newStatus, newPaymentStatus) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus, paymentStatus: newPaymentStatus }));
  };

  const farmerProducts = products.filter(p => p.farmer);
  const pendingProducts = products.filter(p => p.status === 'pending' && p.farmer);
  const totalRevenue = orders.reduce((acc, curr) => curr.paymentStatus === 'paid' || curr.paymentStatus === 'partial_paid' ? acc + curr.totalAmount : acc, 0);

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
          className="mb-8 flex justify-between items-end"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-lg text-slate-600 mt-1">Platform Overview & Management</p>
          </div>
          <p className="text-sm font-medium text-ocean-600 bg-ocean-50 px-4 py-2 rounded-lg">
            Logged in as: {user?.name}
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Farmers</h3>
            <p className="text-3xl font-bold text-ocean-600">--</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold text-ocean-600">{pendingProducts.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-ocean-600">{orders.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-ocean-600">₹{totalRevenue.toLocaleString()}</p>
          </motion.div>
        </motion.div>
        
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button 
            className={`py-3 px-2 font-semibold text-sm border-b-2 transition-colors focus:outline-none ${activeTab === 'farmer_conversations' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('farmer_conversations')}
          >
            Farmer Conversations
          </button>
          <button 
            className={`py-3 px-2 font-semibold text-sm border-b-2 transition-colors focus:outline-none ${activeTab === 'buyer_conversations' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('buyer_conversations')}
          >
            Buyer Conversations
          </button>
          <button 
            className={`py-3 px-2 font-semibold text-sm border-b-2 transition-colors focus:outline-none ${activeTab === 'manage_orders' ? 'border-ocean-600 text-ocean-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('manage_orders')}
          >
            Manage Orders
          </button>
        </div>

        {activeTab === 'farmer_conversations' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Pending Products & Negotiations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 font-semibold text-slate-600">Farmer</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Quantity</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Expected Price</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="6">Loading...</td>
                  </tr>
                ) : farmerProducts.length > 0 ? (
                  farmerProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-slate-800">{product.farmer?.name || 'Unknown'}</td>
                      <td className="py-4 px-4 text-slate-600">{product.name}</td>
                      <td className="py-4 px-4 text-slate-600">{product.quantity} Kg</td>
                      <td className="py-4 px-4 text-slate-600">₹{product.expectedPrice}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                          <Link to={`/negotiation/${product._id}`} className="text-ocean-600 font-medium hover:text-ocean-700">Review</Link>
                        ) : product.status === 'rejected' ? (
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-medium text-sm border border-red-200 bg-red-50 px-2 py-1 rounded">Rejected</span>
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
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="6">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        )}

        {activeTab === 'manage_orders' && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">E-Commerce Product Management</h2>
            <button onClick={() => handleOpenModal()} className="btn-primary text-sm">Add New Product</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Category</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Price / Kg</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Stock (Kgs)</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr><td className="py-4 px-4 text-slate-500 text-center" colSpan="6">Loading...</td></tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={`eco-${product._id}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 flex items-center gap-3">
                        {product.image ? <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded"></div>}
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{product.category || 'General Seafood'}</td>
                      <td className="py-4 px-4 text-slate-600">₹{product.expectedPrice}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQuickStockChange(product, -1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{product.stock || 0}</span>
                          <button onClick={() => handleQuickStockChange(product, 1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600 hover:bg-gray-300">+</button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ocean-500"
                          value={product.ecommerceStatus || 'draft'}
                          onChange={(e) => handleQuickStatusChange(product, e.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-3">
                           <button onClick={() => handleOpenModal(product)} className="text-ocean-600 hover:text-ocean-800 font-medium text-sm">Edit</button>
                           <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-4 px-4 text-slate-500 text-center" colSpan="6">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {activeTab === 'buyer_conversations' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Order Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 font-semibold text-slate-600">Order ID</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Buyer</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Contact</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Total</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Payment</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="8">Loading orders...</td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-mono text-sm text-slate-500">{order._id.substring(0, 8)}...</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{order.buyer?.companyName || order.buyer?.name}</td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {order.contactDetails ? (
                          <>
                            <div className="font-semibold">{order.contactDetails.name}</div>
                            <div>{order.contactDetails.phone}</div>
                            <div className="text-gray-400">{order.contactDetails.location}</div>
                          </>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-slate-600">{order.product?.name} ({order.quantity}kg)</td>
                      <td className="py-4 px-4 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <select 
                          className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ocean-500"
                          value={order.status}
                          onChange={(e) => handleOrderUpdate(order._id, e.target.value, order.paymentStatus)}
                        >
                          <option value="pending_verification">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-ocean-500"
                          value={order.paymentStatus}
                          onChange={(e) => handleOrderUpdate(order._id, order.status, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="partial_paid">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                         <Link to={`/invoice/order/${order._id}`} className="text-ocean-600 font-medium hover:text-ocean-700 text-sm">View Invoice</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="8">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price per Kg (₹)</label>
                    <input type="number" required value={formData.expectedPrice} onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock (Kgs)</label>
                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select value={formData.ecommerceStatus} onChange={(e) => setFormData({...formData, ecommerceStatus: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-ocean-500 outline-none" placeholder="/images/example.png" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-medium transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
