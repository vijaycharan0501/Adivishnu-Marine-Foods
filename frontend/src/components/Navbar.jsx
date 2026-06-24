import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { Anchor, UserCircle, LogOut, Package, ClipboardList, Phone, Mail, Building } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products) || {};
  const { procurements } = useSelector((state) => state.procurement) || {};
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const safeProcurements = Array.isArray(procurements) ? procurements : [];

  const activeNotificationIds = user?.role === 'farmer' ? [
    ...safeProducts.filter(p => p?.status === 'negotiating').map(p => `${p._id}_${p.updatedAt}`),
    ...safeProcurements.filter(proc => {
      if (proc?.status !== 'open') return false;
      const rejectedByMe = proc.rejections?.some(r => r.contractor === user._id || r.contractor?._id === user._id);
      return !rejectedByMe;
    }).map(proc => `${proc._id}_${proc.updatedAt}`)
  ].sort().join(',') : '';

  const [seenNotificationIds, setSeenNotificationIds] = useState(localStorage.getItem(`seenNotifs_${user?._id}`) || '');

  const hasNotification = user?.role === 'farmer' && activeNotificationIds.length > 0 && activeNotificationIds !== seenNotificationIds;

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && activeNotificationIds.length > 0) {
      setSeenNotificationIds(activeNotificationIds);
      localStorage.setItem(`seenNotifs_${user?._id}`, activeNotificationIds);
    }
  };

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Anchor className="h-8 w-8 text-ocean-600" />
              <span className="font-bold text-xl text-slate-800 tracking-tight">Adivishnu<span className="text-ocean-600">Marine</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={`/${user.role}/dashboard`} className="text-sm font-medium text-slate-600 mr-4 hover:text-ocean-600 transition-colors">
                  Dashboard
                </Link>
                
                {user.role === 'farmer' ? (
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={handleProfileClick}
                      className="relative flex items-center gap-2 text-slate-600 hover:text-ocean-600 transition-colors focus:outline-none"
                    >
                      <UserCircle className="h-8 w-8" strokeWidth={1.5} />
                      {hasNotification && (
                        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                        </span>
                      )}
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                        <div className="px-5 py-4 border-b border-gray-50 bg-slate-50/50 rounded-t-2xl">
                          <p className="text-sm font-bold text-slate-800">{user.name}</p>
                          <p className="text-[13px] text-slate-500 flex items-center gap-2 mt-2"><Mail className="w-3.5 h-3.5"/> {user.email}</p>
                          {user.phone && <p className="text-[13px] text-slate-500 flex items-center gap-2 mt-1.5"><Phone className="w-3.5 h-3.5"/> {user.phone}</p>}
                          {user.companyName && <p className="text-[13px] text-slate-500 flex items-center gap-2 mt-1.5"><Building className="w-3.5 h-3.5"/> {user.companyName}</p>}
                        </div>
                        
                        <div className="py-2 px-2">
                          <Link 
                            to="/farmer/dashboard#offers" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-ocean-50 hover:text-ocean-700 rounded-xl transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            My Offers
                          </Link>
                          <Link 
                            to="/farmer/dashboard#requirements" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-ocean-50 hover:text-ocean-700 rounded-xl transition-colors"
                          >
                            <ClipboardList className="w-4 h-4" />
                            My Requirements
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
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-600 mr-2">Hello, {user.name}</span>
                    <button className="btn-secondary text-sm" onClick={onLogout}>
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-ocean-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
