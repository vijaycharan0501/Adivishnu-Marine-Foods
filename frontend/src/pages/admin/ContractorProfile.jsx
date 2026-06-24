import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, User, Phone, Mail, Building, Calendar, Package, ClipboardList, MapPin } from 'lucide-react';
import { getContractors } from '../../features/auth/authSlice';
import { getProducts } from '../../features/products/productSlice';
import { getProcurements } from '../../features/procurements/procurementSlice';

const ContractorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, contractors } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const { procurements } = useSelector((state) => state.procurement);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      if (!contractors || contractors.length === 0) dispatch(getContractors());
      if (!products || products.length === 0) dispatch(getProducts());
      if (!procurements || procurements.length === 0) dispatch(getProcurements());
    }
  }, [user, contractors, products, procurements, navigate, dispatch]);

  const contractor = contractors?.find(c => c._id === id);
  const safeProducts = Array.isArray(products) ? products : [];
  const safeProcurements = Array.isArray(procurements) ? procurements : [];

  const contractorProducts = safeProducts.filter(p => p && p.farmer && p.farmer._id === id);
  const contractorDecisions = safeProcurements.filter(p => {
    const fulfilledByThis = p.fulfilledBy && (p.fulfilledBy._id === id || p.fulfilledBy === id);
    const rejectedByThis = p.rejections && p.rejections.some(r => r.contractor === id || r.contractor._id === id);
    return fulfilledByThis || rejectedByThis;
  });

  if (!contractor) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Loading contractor details...</p>
        <Link to="/admin/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/admin/contractors" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Contractors
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 p-8 mb-8 flex items-start gap-8">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border-4 border-blue-100 relative">
            <User className="w-16 h-16 text-blue-600" />
            {contractorDecisions.length > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{contractor.name}</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">{contractor.companyName || 'Independent Contractor'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="font-medium">{contractor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="font-medium">{contractor.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</p>
                  <p className="font-medium">{new Date(contractor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</p>
                  <p className="font-medium">{contractor.companyName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 md:col-span-2 mt-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workplace Address</p>
                  <p className="font-medium">{contractor.address || 'Address not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products / Offers */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-slate-50/50">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Products & Offers</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[400px]">
              {contractorProducts.length > 0 ? (
                <div className="space-y-4">
                  {contractorProducts.map(p => (
                    <div key={p._id} className="p-4 border border-gray-100 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{p.quantity} Kg • ₹{p.expectedPrice}/kg</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        p.status === 'approved' ? 'bg-green-100 text-green-700' :
                        p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No products listed by this contractor.</p>
              )}
            </div>
          </div>

          {/* Decisions */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-slate-50/50">
              <ClipboardList className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800">Decisions on Requests</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[400px]">
              {contractorDecisions.length > 0 ? (
                <div className="space-y-4">
                  {contractorDecisions.map(proc => {
                    const isAccepted = proc.fulfilledBy && (proc.fulfilledBy._id === id || proc.fulfilledBy === id);
                    const rejection = proc.rejections?.find(r => r.contractor === id || r.contractor?._id === id);
                    
                    return (
                      <div key={proc._id} className="p-4 border border-gray-100 rounded-xl flex justify-between items-start hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-slate-800">{proc.title}</p>
                          <p className="text-sm text-slate-500 mt-1">Target: {proc.targetQuantity} Kg • ₹{proc.expectedPricePerKg}/kg</p>
                          {isAccepted && proc.deliveryTimeDays && (
                            <p className="text-xs text-green-600 font-semibold mt-2 bg-green-50 inline-block px-2 py-1 rounded">
                              Will deliver in {proc.deliveryTimeDays} days
                            </p>
                          )}
                          {!isAccepted && rejection && (
                            <p className="text-xs text-red-600 font-semibold mt-2 bg-red-50 inline-block px-2 py-1 rounded">
                              Reason: {rejection.reason}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isAccepted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isAccepted ? 'Accepted' : 'Rejected'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No decisions made on company requests yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorProfile;
