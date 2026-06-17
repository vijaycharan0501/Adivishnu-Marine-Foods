import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../../features/products/productSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      
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

  const pendingProducts = products.filter(p => p.status === 'pending' || p.status === 'negotiating');
  const approvedProducts = products.filter(p => p.status === 'approved' || p.status === 'sold');
  const totalQuantity = products.reduce((acc, curr) => acc + curr.quantity, 0);

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
          <h1 className="text-3xl font-bold text-slate-900">Farmer Dashboard</h1>
          <p className="text-lg text-slate-600 mt-1">Welcome back, {user?.name}!</p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Offers</h3>
            <p className="text-3xl font-bold text-ocean-600">{products.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Active Negotiations</h3>
            <p className="text-3xl font-bold text-ocean-600">{pendingProducts.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Approved Deals</h3>
            <p className="text-3xl font-bold text-ocean-600">{approvedProducts.length}</p>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="card text-center cursor-pointer transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-medium text-slate-600 mb-2">Total Volume</h3>
            <p className="text-3xl font-bold text-ocean-600">{totalQuantity} Kg</p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Offers</h2>
            <Link to="/farmer/add-product" className="btn-primary">Add New Product</Link>
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
                    <td className="py-4 px-4 text-slate-500 text-center" colSpan="5">Loading products...</td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-slate-800">{product.name}</td>
                      <td className="py-4 px-4 text-slate-600">{product.quantity} Kg</td>
                      <td className="py-4 px-4 text-slate-600">{product.piecesPerKg}</td>
                      <td className="py-4 px-4 text-slate-600">{product.expectedPrice}</td>
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
      </div>
    </div>
  );
};

export default FarmerDashboard;
