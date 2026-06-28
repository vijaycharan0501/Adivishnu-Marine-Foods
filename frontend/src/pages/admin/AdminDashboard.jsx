import { useEffect, useState, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../features/products/productSlice';
import { getOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import { getProcurements, createProcurement, updateProcurementStatus } from '../../features/procurements/procurementSlice';
import { getInquiries, updateInquiryStatus } from '../../features/inquiries/inquirySlice';
import { logout, reset, getContractors } from '../../features/auth/authSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  Home, User, Users, ShoppingBag, ClipboardList, FileText, Anchor, LogOut, Package, IndianRupee, CheckCircle2, X, ShoppingCart, Menu
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, tabValue, isDashboard, activeTab, setActiveTab }) => {
  const isActive = isDashboard ? activeTab === 'dashboard' : activeTab === tabValue;
  return (
    <button 
      onClick={() => setActiveTab(isDashboard ? 'dashboard' : tabValue)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 mx-4 rounded-xl transition-all font-semibold text-[15px] ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
      style={{ width: 'calc(100% - 32px)' }}
    >
      <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-blue-600' : 'text-slate-500'}`} strokeWidth={2} />
      {label}
    </button>
  );
};

const AdminDashboard = () => {
  const { user, contractors } = useSelector((state) => state.auth) || {};
  const { products, isLoading: productsLoading } = useSelector((state) => state.products) || {};
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders) || {};
  const { procurements } = useSelector((state) => state.procurement) || {};
  const { inquiries, isLoading: inquiriesLoading } = useSelector((state) => state.inquiry) || {};
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      dispatch(getProducts());
      dispatch(getOrders());
      dispatch(getProcurements());
      dispatch(getInquiries());
      dispatch(getContractors());
      
      const newSocket = io('http://localhost:5000');
      newSocket.on('receive_offer', (data) => {
        if (data.senderRole !== 'admin') {
          toast.success(`New bid received from a Contractor!`);
          dispatch(getProducts()); // Automatically refresh the data
        }
      });
      return () => newSocket.close();
    }
  }, [user, navigate, dispatch]);

  const [activeTab, setActiveTab] = useState('farmer_conversations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [dateFilter, setDateFilter] = useState('');
  const dateInputRef = useRef(null);

  const [viewedItems, setViewedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminViewedItems_' + user?._id) || '[]'); } catch { return []; }
  });

  const markAsViewed = (item) => {
    const key = item._id + '_' + (item.updatedAt || item.createdAt || '0');
    if (!viewedItems.includes(key)) {
      const newViewed = [...viewedItems, key];
      setViewedItems(newViewed);
      localStorage.setItem('adminViewedItems_' + user?._id, JSON.stringify(newViewed));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({ id: null, name: '', category: 'General Seafood', expectedPrice: '', stock: '', image: '', ecommerceStatus: 'draft' });
  const [procurementForm, setProcurementForm] = useState({ title: '', category: 'General Seafood', targetQuantity: '', expectedPricePerKg: '', assignedTo: [] });

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({ id: product._id, name: product.name, category: product.category || 'General Seafood', expectedPrice: product.expectedPrice, stock: product.stock || 0, image: product.image || '', ecommerceStatus: product.ecommerceStatus || 'draft' });
    } else {
      setFormData({ id: null, name: '', category: 'General Seafood', expectedPrice: '', stock: '', image: '', ecommerceStatus: 'published' });
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
      ecommerceStatus: formData.ecommerceStatus
    };
    if (formData.id) {
      dispatch(updateAdminProduct({ id: formData.id, productData: payload }))
        .unwrap()
        .then(() => toast.success('Product updated successfully!'))
        .catch((err) => toast.error(err || 'Failed to update product'));
    } else {
      dispatch(createAdminProduct(payload))
        .unwrap()
        .then(() => toast.success('Product added successfully!'))
        .catch((err) => toast.error(err || 'Failed to add product'));
    }
    setIsModalOpen(false);
  };

  const handleSaveProcurement = (e) => {
    e.preventDefault();
    dispatch(createProcurement({
      title: procurementForm.title,
      category: procurementForm.category,
      targetQuantity: Number(procurementForm.targetQuantity),
      expectedPricePerKg: Number(procurementForm.expectedPricePerKg),
      assignedTo: procurementForm.assignedTo
    }));
    setIsProcurementModalOpen(false);
    setProcurementForm({ title: '', category: 'General Seafood', targetQuantity: '', expectedPricePerKg: '', assignedTo: [] });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteAdminProduct(id));
    }
  };

  const handleQuickStatusChange = (product, newStatus) => {
    dispatch(updateAdminProduct({ id: product._id, productData: { ecommerceStatus: newStatus } }));
  };



  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = useMemo(() => Array.isArray(orders) ? orders : [], [orders]);
  const safeProcurements = Array.isArray(procurements) ? procurements : [];
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];

  const farmerProducts = safeProducts.filter(p => p.farmer && (p.status === 'pending' || p.status === 'negotiating' || p.status === 'rejected' || p.status === 'approved'));

  const filteredFarmerProducts = farmerProducts.filter(product => {
    if (!dateFilter) return true;
    const dateToUse = product.updatedAt || product.createdAt;
    if (!dateToUse) return false;
    const pDate = new Date(dateToUse);
    const pDateString = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
    return pDateString === dateFilter;
  });

  const sortedFarmerProducts = [...filteredFarmerProducts].sort((a, b) => {
    return new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0);
  });

  const filteredOrders = safeOrders.filter(order => {
    if (!dateFilter) return true;
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const orderDateString = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
    return orderDateString === dateFilter;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });

  const sortedProcurements = [...safeProcurements].sort((a, b) => {
    return new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0);
  });

  const sortedInquiries = [...safeInquiries].sort((a, b) => {
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });

  const pendingProducts = safeProducts.filter(p => p.status === 'pending' && p.farmer);
  const totalRevenue = safeOrders.reduce((acc, curr) => curr && (curr.paymentStatus === 'paid' || curr.paymentStatus === 'partial_paid') ? acc + (curr.totalAmount || 0) : acc, 0);

  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => ({ name: month, revenue: 0 }));
    
    const currentYear = new Date().getFullYear();
    safeOrders.forEach(order => {
      if (!order || !order.createdAt) return;
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        if (order.paymentStatus === 'paid' || order.paymentStatus === 'partial_paid') {
          const monthIndex = orderDate.getMonth();
          data[monthIndex].revenue += (order.totalAmount || 0);
        }
      }
    });
    return data;
  }, [safeOrders]);

  const yearlyCollectionData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let paid = 0;
    let pending = 0;
    
    safeOrders.forEach(order => {
      if (!order || !order.createdAt) return;
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        if (order.paymentStatus === 'paid' || order.paymentStatus === 'partial_paid') {
          paid += (order.totalAmount || 0);
        } else {
          pending += (order.totalAmount || 0);
        }
      }
    });
    
    return [
      { name: 'Collected', value: paid, color: '#10B981' },
      { name: 'Pending', value: pending, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  }, [safeOrders]);

  // Notification states
  const hasFarmerNotification = sortedFarmerProducts.some(p => p?.status === 'negotiating' || p?.status === 'pending');
  const hasOrderNotification = sortedOrders.some(order => order?.status === 'pending_verification');
  const hasProcurementNotification = sortedProcurements.some(proc => proc?.status === 'fulfilled');
  const hasInquiryNotification = sortedInquiries.some(inq => inq?.status === 'pending');



  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.05)] ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'}`}>
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Anchor className="h-9 w-9 text-blue-600" strokeWidth={2.5} />
            <div className="flex flex-col">
              <span className="font-extrabold text-[22px] text-slate-800 tracking-tight leading-none">
                Adivishnu<span className="text-blue-600">Marine</span>
              </span>
              <span className="text-xs text-slate-500 font-semibold tracking-wide mt-1">Foods Pvt. Ltd.</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 mt-2">
          <SidebarItem icon={Home} label="Dashboard" isDashboard={true} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={ShoppingBag} label="Contractors" tabValue="farmer_conversations" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Users} label="Buyer Orders" tabValue="buyer_conversations" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={ShoppingBag} label="Store Products" tabValue="manage_orders" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={ClipboardList} label="Requests" tabValue="company_requests" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={FileText} label="Inquiries" tabValue="buyer_inquiries" activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {/* Bottom Sidebar Artwork */}
        <div className="h-72 relative mt-auto overflow-hidden">
           {/* Fallback to generated image if available, else standard color block */}
           <img src="/images/sidebar_art.png" alt="Seafood Art" className="w-full h-full object-cover object-bottom opacity-90 mix-blend-multiply" onError={(e) => e.target.style.display = 'none'} />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none"></div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        
        {/* Background Artwork */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none z-0">
          <img src="/images/bottom_landscape.png" alt="" className="w-full h-full object-cover object-bottom opacity-60 mix-blend-multiply" onError={(e) => e.target.style.display = 'none'} />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 via-[#F8FAFC]/80 to-[#F8FAFC]"></div>
        </div>
        
        {/* Top Navbar Area */}
        <header className="h-20 flex justify-between items-center px-10 shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-white rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <Menu className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <Anchor className="h-7 w-7 text-blue-600" strokeWidth={2.5} />
              <span className="font-extrabold text-xl text-slate-800 tracking-tight leading-none">
                Adivishnu<span className="text-blue-600">Marine</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-blue-600 font-semibold hover:text-blue-700 text-sm">Dashboard</Link>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <User className="w-6 h-6 text-slate-500 mt-1" />
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-5 py-3 border-b border-gray-50 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'Admin'}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">Administrator</p>
                  </div>
                  
                  <div className="py-2 px-2">
                    <Link 
                      to="/admin/contractors" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-ocean-50 hover:text-ocean-700 rounded-xl transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Contractor Details
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-50 py-2 px-2">
                    <button 
                      onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-10 pb-12 relative z-10 scrollbar-hide">
          
          <div className="flex justify-between items-end mb-8 mt-4">
            <div>
              <h1 className="text-[34px] font-extrabold text-slate-800 leading-tight tracking-tight">Admin Dashboard</h1>
              <p className="text-[15px] text-slate-500 font-medium mt-1">Platform Overview & Management</p>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 to-ocean-600 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-10 flex items-center h-[180px]">
            <div className="relative z-10 p-10 flex-1">
               <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">WelCome To SeaFood Industry, {user?.name || 'Admin'}!</h2>
               <p className="text-blue-100 font-medium text-[15px]">Monitor your marketplace, fulfill requests, and manage incoming shipments.</p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-2/3 h-full overflow-hidden mask-image-to-left">
               <img src="/images/bottom_landscape.png" alt="Ocean Landscape" className="w-full h-full object-cover opacity-80 mix-blend-overlay transform scale-105" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="col-span-2 bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue ({new Date().getFullYear()})</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-1 bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Yearly Collection Breakdown</h3>
              <div className="h-[300px] flex flex-col justify-center">
                {yearlyCollectionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={yearlyCollectionData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {yearlyCollectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [`₹${value}`, 'Amount']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 font-medium">No data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-blue-600" strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Contractors</p>
                <p className="text-3xl font-extrabold text-blue-600 leading-none">--</p>
              </div>
            </div>
            <div className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Pending Approvals</p>
                <p className="text-3xl font-extrabold text-green-600 leading-none">{pendingProducts.length}</p>
              </div>
            </div>
            <div className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Package className="w-8 h-8 text-blue-600" strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Orders</p>
                <p className="text-3xl font-extrabold text-blue-600 leading-none">{safeOrders.length}</p>
              </div>
            </div>
            <div className="bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <IndianRupee className="w-8 h-8 text-green-600" strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-extrabold text-green-600 leading-none">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Capsule Navs */}
          <div className="flex justify-between items-center mb-10 relative z-20 w-full">
            
            {/* Left Group (3 items) */}
            <div className="inline-flex h-[60px] p-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 relative">
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[160px] rounded-full bg-blue-600 transition-all duration-300 ease-out ${
                  activeTab === 'farmer_conversations' ? 'translate-x-0 opacity-100 scale-100' :
                  activeTab === 'buyer_conversations' ? 'translate-x-[160px] opacity-100 scale-100' :
                  activeTab === 'manage_orders' ? 'translate-x-[320px] opacity-100 scale-100' : 
                  'opacity-0 scale-95 pointer-events-none'
                }`} 
              />
              <button onClick={() => setActiveTab('farmer_conversations')} className={`relative z-10 w-[160px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-colors ${activeTab === 'farmer_conversations' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <User className="w-[18px] h-[18px]" /> Contractors
                {hasFarmerNotification && (
                  <span className="absolute top-2.5 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('buyer_conversations')} className={`relative z-10 w-[160px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-colors ${activeTab === 'buyer_conversations' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <ShoppingCart className="w-[18px] h-[18px]" /> Buyers
              </button>
              <button onClick={() => setActiveTab('manage_orders')} className={`relative z-10 w-[160px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-colors ${activeTab === 'manage_orders' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <ShoppingBag className="w-[18px] h-[18px]" /> E-Commerce
                {hasOrderNotification && (
                  <span className="absolute top-2.5 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Right Group (2 items) */}
            <div className="inline-flex h-[60px] p-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 relative">
              <div 
                className={`absolute top-1.5 bottom-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-out ${
                  activeTab === 'company_requests' ? 'translate-x-0 w-[200px] opacity-100 scale-100' :
                  activeTab === 'buyer_inquiries' ? 'translate-x-[200px] w-[160px] opacity-100 scale-100' : 
                  'opacity-0 scale-95 pointer-events-none w-[160px]'
                }`} 
              />
              <button onClick={() => setActiveTab('company_requests')} className={`relative z-10 w-[200px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-colors ${activeTab === 'company_requests' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <ClipboardList className="w-[18px] h-[18px]" /> Request to Contractor
                {hasProcurementNotification && (
                  <span className="absolute top-2.5 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('buyer_inquiries')} className={`relative z-10 w-[160px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-colors ${activeTab === 'buyer_inquiries' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <FileText className="w-[18px] h-[18px]" /> Inquiries
                {hasInquiryNotification && (
                  <span className="absolute top-2.5 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Tables Section */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden relative z-20">
            {activeTab === 'farmer_conversations' && (
            <div>
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[17px] font-bold text-slate-800">Pending Products & Negotiations</h2>
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
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Contractor</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Product</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Quantity</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Expected Price</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Status</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">Loading...</td></tr>
                    ) : sortedFarmerProducts.length > 0 ? (
                      sortedFarmerProducts.map((product, index) => product && (
                        <tr key={product._id || `farmer_prod_${index}`} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-medium text-slate-600 relative">
                            {product.farmer?.companyName ? (
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-bold">{product.farmer.companyName}</span>
                                <span className="text-xs text-slate-500">{product.farmer.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-800 font-bold">{product.farmer?.name || 'Unknown'}</span>
                            )}
                            {(product.status === 'pending' || product.status === 'negotiating') && !viewedItems.includes(product._id + '_' + (product.updatedAt || product.createdAt || '0')) && (
                              <span className="absolute top-1/2 -translate-y-1/2 left-3 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-8 font-medium text-slate-600">{product.name}</td>
                          <td className="py-5 px-8 font-medium text-slate-600">{product.quantity} Kg</td>
                          <td className="py-5 px-8 font-medium text-slate-600">₹{product.expectedPrice}</td>
                          <td className="py-5 px-8">
                            <span className={`relative px-4 py-1.5 rounded-lg text-[13px] font-semibold ${
                              product.status === 'pending' ? 'bg-[#FFF3E0] text-[#E65100]' :
                              product.status === 'negotiating' ? 'bg-blue-50 text-blue-600' :
                              product.status === 'approved' ? 'bg-green-50 text-green-600' :
                              product.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {product.status === 'negotiating' && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                              )}
                              {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="py-5 px-8">
                            {product.status === 'pending' || product.status === 'negotiating' ? (
                              <Link onClick={() => markAsViewed(product)} to={`/negotiation/${product._id}`} className="text-blue-600 font-semibold text-sm hover:text-blue-800">
                                Review
                              </Link>
                            ) : product.status === 'rejected' ? (
                              <span className="text-red-500 font-semibold text-sm">Rejected</span>
                            ) : (
                              <Link to={`/invoice/product/${product._id}`} className="text-blue-600 font-semibold text-sm hover:text-blue-800">
                                Contract
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {activeTab === 'manage_orders' && (
            <div>
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[17px] font-bold text-slate-800">E-Commerce Products</h2>
                <button onClick={() => handleOpenModal()} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">+ Add Product</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Product</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Category</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Price / Kg</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Stock (Kgs)</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Status</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">Loading...</td></tr>
                    ) : safeProducts.length > 0 ? (
                      safeProducts.map((product, index) => product && (
                        <tr key={`eco-${product._id || index}`} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-8 flex items-center gap-4">
                            {product.image ? <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200"></div>}
                            <span className="font-medium text-slate-600">{product.name}</span>
                          </td>
                          <td className="py-4 px-8 font-medium text-slate-600">{product.category || 'General Seafood'}</td>
                          <td className="py-4 px-8 font-medium text-slate-600">₹{product.expectedPrice}</td>
                          <td className="py-4 px-8 font-medium text-slate-600">{product.stock || 0}</td>
                          <td className="py-4 px-8">
                            <select 
                              className="text-sm font-semibold border-none bg-transparent outline-none text-slate-600 cursor-pointer"
                              value={product.ecommerceStatus || 'draft'}
                              onChange={(e) => handleQuickStatusChange(product, e.target.value)}
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="out_of_stock">Out of Stock</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td className="py-4 px-8">
                            <div className="flex gap-4">
                               <button onClick={() => handleOpenModal(product)} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">Edit</button>
                               <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 font-semibold text-sm hover:text-red-700 transition-colors">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {activeTab === 'buyer_conversations' && (
            <div>
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[17px] font-bold text-slate-800">Order Management</h2>
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
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Order ID</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Buyer</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Product</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Total</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Status</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Payment</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading ? (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">Loading orders...</td></tr>
                    ) : sortedOrders.length > 0 ? (
                      sortedOrders.map((order, index) => order && (
                        <tr key={order._id || `order_${index}`} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-medium text-slate-600 relative">
                            #{order._id ? order._id.substring(0, 8) : 'N/A'}
                            {order.status === 'pending_verification' && !viewedItems.includes(order._id + '_' + (order.updatedAt || order.createdAt || '0')) && (
                              <span className="absolute top-1/2 -translate-y-1/2 left-3 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-8 font-medium text-slate-600 relative">
                            {order.buyer?.companyName ? (
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-bold">{order.buyer.companyName}</span>
                                <span className="text-xs text-slate-500">{order.contactDetails?.name || order.buyer.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-bold">{order.contactDetails?.name || order.buyer?.name || 'Unknown'}</span>
                                {order.buyer?.name && order.contactDetails?.name && order.contactDetails.name !== order.buyer.name && (
                                  <span className="text-xs text-slate-500">{order.buyer.name}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-5 px-8 font-medium text-slate-600">{order.product?.name || 'Unknown'} ({order.quantity || 0}kg)</td>
                          <td className="py-5 px-8 font-medium text-slate-600">₹{(order.totalAmount || 0).toLocaleString()}</td>
                          <td className="py-5 px-8">
                            <select 
                              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer border ${
                                order.status === 'pending_verification' ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]' :
                                order.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-green-50 text-green-600 border-green-200'
                              } focus:outline-none`}
                              value={order.status || 'pending_verification'}
                              onChange={(e) => { 
                                markAsViewed(order); 
                                dispatch(updateOrderStatus({ orderId: order._id, status: e.target.value })); 
                              }}
                            >
                              <option value="pending_verification">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="py-5 px-8">
                            <select 
                              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer border ${
                                order.paymentStatus === 'pending' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                order.paymentStatus === 'partial_paid' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                'bg-green-50 text-green-600 border-green-200'
                              } focus:outline-none`}
                              value={order.paymentStatus || 'pending'}
                              onChange={(e) => { 
                                markAsViewed(order); 
                                dispatch(updateOrderStatus({ orderId: order._id, paymentStatus: e.target.value })); 
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="partial_paid">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td className="py-5 px-8">
                             <div className="flex items-center gap-4">
                               <button 
                                 onClick={() => {
                                   setSelectedOrder(order);
                                   setIsCustomerModalOpen(true);
                                 }}
                                 className="text-ocean-600 font-semibold text-sm hover:text-ocean-800 transition-colors"
                               >
                                 Info
                               </button>
                               <Link onClick={() => markAsViewed(order)} to={`/invoice/order/${order._id}`} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">Invoice</Link>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="6">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {activeTab === 'company_requests' && (
            <div>
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[17px] font-bold text-slate-800">Company Requests</h2>
                <button onClick={() => setIsProcurementModalOpen(true)} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">+ New Request</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Title</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Category</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Target Qty</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Expected Price/Kg</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Status</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProcurements.length > 0 ? (
                      sortedProcurements.map((proc, index) => proc && (
                        <tr key={proc._id || `proc_${index}`} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-medium text-slate-600 relative">
                            {proc.title || 'Untitled'}
                            {proc.status === 'fulfilled' && !viewedItems.includes(proc._id + '_' + (proc.updatedAt || proc.createdAt || '0')) && (
                              <span className="absolute top-1/2 -translate-y-1/2 left-3 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-8 font-medium text-slate-600">{proc.category || 'General'}</td>
                          <td className="py-5 px-8 font-medium text-slate-600">{proc.targetQuantity || 0} kg</td>
                          <td className="py-5 px-8 font-medium text-slate-600">₹{proc.expectedPricePerKg || 0}</td>
                          <td className="py-5 px-8">
                            <span className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold ${proc.status === 'open' ? 'bg-[#FFF3E0] text-[#E65100]' : 'bg-green-50 text-green-600'}`}>
                              {proc.status ? proc.status.charAt(0).toUpperCase() + proc.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-4">
                              <select 
                                className="text-sm font-semibold border-none bg-transparent outline-none text-slate-600 cursor-pointer"
                                value={proc.status || 'open'}
                                onChange={(e) => dispatch(updateProcurementStatus({ id: proc._id, status: e.target.value }))}
                              >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                              </select>
                              <Link onClick={() => markAsViewed(proc)} to={`/admin/procurement/${proc._id}`} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors flex items-center gap-1">
                                Info
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-8 text-slate-500">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {activeTab === 'buyer_inquiries' && (
            <div>
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-[17px] font-bold text-slate-800">Buyer Inquiries</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white">
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Buyer</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Product</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Est. Qty</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Message</th>
                      <th className="py-4 px-8 font-bold text-sm text-slate-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiriesLoading ? (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="5">Loading inquiries...</td></tr>
                    ) : sortedInquiries.length > 0 ? (
                      sortedInquiries.map((inq, index) => inq && (
                        <tr key={inq._id || `inq_${index}`} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-medium text-slate-600 relative">
                            {inq.status === 'pending' && !viewedItems.includes(inq._id + '_' + (inq.updatedAt || inq.createdAt || '0')) && (
                              <span className="absolute top-1/2 -translate-y-1/2 left-3 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                              </span>
                            )}
                            <div className="ml-5">
                              {inq.buyer?.companyName ? (
                                <div className="flex flex-col">
                                  <span className="text-slate-800 font-bold">{inq.buyer.companyName}</span>
                                  <span className="text-xs text-slate-500">{inq.buyer.name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-800 font-bold">{inq.buyer?.name || 'Unknown'}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-8 font-medium text-slate-600">{inq.productName || 'Unknown'}</td>
                          <td className="py-5 px-8 font-medium text-slate-600">{inq.estimatedQuantity || 0}</td>
                          <td className="py-5 px-8 font-medium text-slate-600 max-w-xs truncate">{inq.message || ''}</td>
                          <td className="py-5 px-8">
                            <select 
                              className="text-sm font-semibold border-none bg-transparent outline-none text-slate-600 cursor-pointer"
                              value={inq.status || 'pending'}
                              onChange={(e) => { markAsViewed(inq); dispatch(updateInquiryStatus({ id: inq._id, status: e.target.value })); }}
                            >
                              <option value="pending">Pending</option>
                              <option value="responded">Responded</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="5">No buyer inquiries found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
          
        </main>
      </div>

      {/* Modals remain mostly structurally same but with updated rounded UI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-slate-800">{formData.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-1 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price per Kg (₹)</label>
                    <input type="number" required value={formData.expectedPrice} onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock (Kgs)</label>
                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select value={formData.ecommerceStatus} onChange={(e) => setFormData({...formData, ecommerceStatus: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 cursor-pointer">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
                  <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" placeholder="/images/example.png" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-slate-600 rounded-full hover:bg-gray-50 font-bold transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-colors shadow-lg shadow-blue-600/30">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProcurementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-slate-800">Post Company Request</h3>
              <button onClick={() => setIsProcurementModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-1 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveProcurement} className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requested Product Name</label>
                  <input type="text" required value={procurementForm.title} onChange={(e) => setProcurementForm({...procurementForm, title: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" placeholder="e.g. Mud Crabs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <input type="text" value={procurementForm.category} onChange={(e) => setProcurementForm({...procurementForm, category: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Qty (Kgs)</label>
                    <input type="number" required value={procurementForm.targetQuantity} onChange={(e) => setProcurementForm({...procurementForm, targetQuantity: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Price (₹/Kg)</label>
                    <input type="number" required value={procurementForm.expectedPricePerKg} onChange={(e) => setProcurementForm({...procurementForm, expectedPricePerKg: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign to Contractor(s)</label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
                    {contractors?.map(contractor => (
                      <label key={contractor._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={procurementForm.assignedTo.includes(contractor._id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setProcurementForm(prev => ({
                              ...prev,
                              assignedTo: isChecked 
                                ? [...prev.assignedTo, contractor._id] 
                                : prev.assignedTo.filter(id => id !== contractor._id)
                            }));
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">{contractor.name}</span>
                      </label>
                    ))}
                    {(!contractors || contractors.length === 0) && <p className="text-sm text-slate-500 italic p-2">No contractors found.</p>}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 italic">*If none are selected, the request will be broadcasted to all contractors.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsProcurementModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-slate-600 rounded-full hover:bg-gray-50 font-bold transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-colors shadow-lg shadow-blue-600/30">Post Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCustomerModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-slate-800">Customer Details</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-1 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company / Account Name</p>
                <p className="text-lg font-bold text-slate-800">{selectedOrder.buyer?.companyName || selectedOrder.buyer?.name || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Personal / Contact Name</p>
                <p className="text-md font-medium text-slate-700">{selectedOrder.contactDetails?.name || selectedOrder.buyer?.name || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-slate-700">{selectedOrder.buyer?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-slate-700">{selectedOrder.buyer?.phone || selectedOrder.contactDetails?.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Location</p>
                <p className="font-medium text-slate-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                  {selectedOrder.contactDetails?.location || selectedOrder.buyer?.location || 'No shipping address provided.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button onClick={() => setIsCustomerModalOpen(false)} className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
