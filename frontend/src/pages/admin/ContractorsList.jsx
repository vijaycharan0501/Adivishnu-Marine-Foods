import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, User, Eye } from 'lucide-react';
import { getContractors } from '../../features/auth/authSlice';
import { getProcurements } from '../../features/procurements/procurementSlice';

const ContractorsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, contractors } = useSelector((state) => state.auth);
  const { procurements } = useSelector((state) => state.procurement);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      if (!contractors || contractors.length === 0) dispatch(getContractors());
      if (!procurements || procurements.length === 0) dispatch(getProcurements());
    }
  }, [user, contractors, procurements, navigate, dispatch]);

  const safeProcurements = Array.isArray(procurements) ? procurements : [];

  const hasRecentActivity = (contractorId) => {
    return safeProcurements.some(p => {
      const fulfilledByThis = p.fulfilledBy && (p.fulfilledBy._id === contractorId || p.fulfilledBy === contractorId);
      const rejectedByThis = p.rejections && p.rejections.some(r => r.contractor === contractorId || r.contractor._id === contractorId);
      return fulfilledByThis || rejectedByThis;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Contractor Details</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="py-4 px-8 font-bold text-sm text-slate-800">Name</th>
                  <th className="py-4 px-8 font-bold text-sm text-slate-800">Company</th>
                  <th className="py-4 px-8 font-bold text-sm text-slate-800">Email</th>
                  <th className="py-4 px-8 font-bold text-sm text-slate-800">Phone</th>
                  <th className="py-4 px-8 font-bold text-sm text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractors?.length > 0 ? (
                  contractors.map((c) => (
                    <tr key={c._id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-medium text-slate-600 relative">
                        {c.name}
                        {hasRecentActivity(c._id) && (
                          <span className="absolute top-1/2 -translate-y-1/2 -left-2 flex h-2 w-2 ml-4 mt-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-8 font-medium text-slate-600">{c.companyName || '-'}</td>
                      <td className="py-5 px-8 font-medium text-slate-600">{c.email}</td>
                      <td className="py-5 px-8 font-medium text-slate-600">{c.phone || '-'}</td>
                      <td className="py-5 px-8">
                        <Link to={`/admin/contractor/${c._id}`} className="text-blue-600 font-semibold text-sm hover:text-blue-800 flex items-center gap-1">
                          <Eye className="w-4 h-4" /> View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-8 px-8 text-slate-500 text-center" colSpan="5">No contractors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorsList;
