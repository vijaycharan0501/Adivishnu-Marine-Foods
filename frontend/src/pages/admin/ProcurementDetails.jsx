import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProcurements } from '../../features/procurements/procurementSlice';
import { ArrowLeft, CheckCircle2, XCircle, Send, PackageSearch, Clock } from 'lucide-react';

const ProcurementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { procurements, isLoading } = useSelector((state) => state.procurement);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      if (!procurements || procurements.length === 0) {
        dispatch(getProcurements());
      }
    }
  }, [user, procurements, navigate, dispatch]);

  const procurement = procurements.find(p => p._id === id);

  if (isLoading || !procurement) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-slate-500 text-lg">Loading details...</p>
      </div>
    );
  }

  const assignedCount = procurement.assignedTo?.length || 0;
  const acceptances = procurement.acceptedBy || [];
  const rejections = procurement.rejections || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{procurement.title}</h1>
              <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                <PackageSearch className="w-4 h-4" /> {procurement.category} • Target: {procurement.targetQuantity} Kg • ₹{procurement.expectedPricePerKg}/kg
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
              procurement.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {procurement.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: Sent To */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
            <div className="p-5 border-b border-gray-100 bg-blue-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Sent To</h2>
                <p className="text-sm text-slate-500">{assignedCount === 0 ? 'Broadcasted to all' : `${assignedCount} Contractors`}</p>
              </div>
            </div>
            <div className="p-5 overflow-y-auto max-h-[500px]">
              {assignedCount === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 font-medium">Global Request</p>
                  <p className="text-sm text-slate-400 mt-1">Visible to all registered contractors.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {procurement.assignedTo.map(c => (
                    <div key={c._id} className="p-3 border border-gray-50 rounded-xl hover:bg-slate-50 transition-colors">
                      <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.companyName || 'Independent'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Accepted & Rejected) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Section 2: Accepted By */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-green-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Accepted By</h2>
                  <p className="text-sm text-slate-500">{acceptances.length} Contractors</p>
                </div>
              </div>
              <div className="p-6">
                {acceptances.length > 0 ? (
                  <div className="space-y-4">
                    {acceptances.map((acc, index) => (
                      <div key={index} className="flex items-start gap-6 bg-green-50/30 p-6 rounded-2xl border border-green-100">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800">{acc.contractor?.name}</h3>
                          <p className="text-slate-600 font-medium mt-1">{acc.contractor?.companyName || 'Independent Contractor'}</p>
                          
                          <div className="mt-4 flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span>Delivery in <strong className="text-slate-800">{acc.deliveryTimeDays} Days</strong></span>
                            </div>
                          </div>
                          
                          <Link to={`/admin/contractor/${acc.contractor?._id}`} className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No one has accepted this request yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Rejected By */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-red-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Rejected By</h2>
                  <p className="text-sm text-slate-500">{rejections.length} Contractors</p>
                </div>
              </div>
              <div className="p-5 overflow-y-auto max-h-[400px]">
                {rejections.length > 0 ? (
                  <div className="space-y-4">
                    {rejections.map((rej, index) => (
                      <div key={index} className="p-4 border border-red-50 bg-red-50/20 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-800">{rej.contractor?.name || 'Unknown Contractor'}</p>
                          <p className="text-xs text-slate-500">{rej.contractor?.companyName || 'Independent'}</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-red-100 text-sm shadow-sm">
                          <span className="font-semibold text-slate-700">Reason:</span> <span className="text-slate-600">{rej.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No rejections recorded.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProcurementDetails;
