import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { startNegotiation, addOffer, updateNegotiationStatus, updateNegotiationData, updateContactDetails } from '../features/negotiations/negotiationSlice';
import { ArrowLeft, Send } from 'lucide-react';
import io from 'socket.io-client';

let socket;

const Negotiation = () => {
  const { productId } = useParams();
  const [priceOffer, setPriceOffer] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', phone: '', location: '' });
  
  const { user } = useSelector((state) => state.auth);
  const { negotiation, isLoading } = useSelector((state) => state.negotiation);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(startNegotiation(productId));
    }
  }, [user, productId, dispatch, navigate]);

  useEffect(() => {
    if (negotiation?._id) {
      socket = io('http://localhost:5000');
      socket.emit('join_room', negotiation._id);

      socket.on('new_offer', (updatedNegotiation) => {
        dispatch(updateNegotiationData(updatedNegotiation));
      });

      socket.on('negotiation_status_update', (updatedNegotiation) => {
        dispatch(updateNegotiationData(updatedNegotiation));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [negotiation?._id, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation?.history]);

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!priceOffer || isNaN(priceOffer)) return;
    
    dispatch(addOffer({ negotiationId: negotiation._id, price: Number(priceOffer) }));
    setPriceOffer('');
  };

  const handleStatusUpdate = (status) => {
    dispatch(updateNegotiationStatus({ negotiationId: negotiation._id, status }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    dispatch(updateContactDetails({ negotiationId: negotiation._id, contactDetails: contactForm }));
  };

  if (isLoading || !negotiation) {
    return <div className="min-h-screen flex items-center justify-center">Loading negotiation...</div>;
  }

  const isFarmer = user.role === 'farmer';
  const isAdmin = user.role === 'admin';
  const isActive = negotiation.status === 'active';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to={`/${user.role}/dashboard`} className="text-ocean-600 hover:text-ocean-700 flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Negotiation Details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className={`font-semibold ${
                    negotiation.status === 'accepted' ? 'text-green-600' :
                    negotiation.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {negotiation.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {isAdmin && isActive && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => handleStatusUpdate('accepted')} className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg font-medium transition-colors border border-green-200">
                    Accept Current Offer
                  </button>
                  <button onClick={() => handleStatusUpdate('rejected')} className="w-full bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded-lg font-medium transition-colors border border-red-200">
                    Reject Offer
                  </button>
                </div>
              </div>
            )}
            
            {isFarmer && isActive && (
               <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => handleStatusUpdate('accepted')} className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg font-medium transition-colors border border-green-200">
                    Accept Admin's Offer
                  </button>
                  <button onClick={() => handleStatusUpdate('rejected')} className="w-full bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded-lg font-medium transition-colors border border-red-200">
                    Reject Offer
                  </button>
                </div>
              </div>
            )}

            {isFarmer && negotiation.status === 'accepted' && !negotiation.contactDetails && (
              <div className="card mt-6">
                <h3 className="font-bold text-slate-800 mb-3">Provide Contact Details</h3>
                <p className="text-sm text-slate-500 mb-4">Please provide your details so the admin can contact you to finalize the deal.</p>
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <input type="text" placeholder="Full Name" required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ocean-500 outline-none" />
                  </div>
                  <div>
                    <input type="tel" placeholder="Phone Number" required value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ocean-500 outline-none" />
                  </div>
                  <div>
                    <input type="text" placeholder="Location / Address" required value={contactForm.location} onChange={(e) => setContactForm({...contactForm, location: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-ocean-500 outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-ocean-600 text-white hover:bg-ocean-700 py-2 rounded-lg font-medium transition-colors">
                    Submit Details
                  </button>
                </form>
              </div>
            )}

            {negotiation.status === 'accepted' && negotiation.contactDetails && (
              <div className="card bg-green-50 border border-green-100 mt-6">
                <h3 className="font-bold text-green-800 mb-3">Contact Details Provided</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Name:</strong> {negotiation.contactDetails.name}</p>
                  <p><strong>Phone:</strong> {negotiation.contactDetails.phone}</p>
                  <p><strong>Location:</strong> {negotiation.contactDetails.location}</p>
                </div>
              </div>
            )}

            {isAdmin && negotiation.status === 'accepted' && (
              <div className="card mt-6 border border-red-200 bg-red-50">
                <h3 className="font-bold text-red-800 mb-2">Physical Inspection</h3>
                <p className="text-sm text-red-700 mb-4">If the physical quality check fails, you can revoke and reject this deal.</p>
                <button onClick={() => handleStatusUpdate('rejected')} className="w-full bg-red-600 text-white hover:bg-red-700 py-2 rounded-lg font-medium transition-colors shadow-sm">
                  Reject Deal (Post-Inspection)
                </button>
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 card flex flex-col h-[600px] p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="font-bold text-lg text-slate-800">Offer History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {negotiation.history.map((offer, index) => {
                const isOwnOffer = offer.offeredBy === user.role;
                return (
                  <div key={index} className={`flex flex-col ${isOwnOffer ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1">
                      {offer.offeredBy === 'farmer' ? 'Farmer' : 'Admin'} • {new Date(offer.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      isOwnOffer ? 'bg-ocean-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="text-sm">
                        {isOwnOffer ? 'My offer price is ' : 'They offered '}
                        <span className="font-bold text-lg">₹{offer.price}/kg</span>.
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {isActive ? (
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendOffer} className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={priceOffer}
                      onChange={(e) => setPriceOffer(e.target.value)}
                      placeholder="Enter your counter offer per Kg"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-ocean-600 hover:bg-ocean-700 text-white p-3 rounded-xl transition-colors active:scale-95 flex items-center justify-center">
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6 bg-white border-t border-gray-100 text-center">
                <p className={`font-medium ${negotiation.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                  This negotiation is {negotiation.status}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Negotiation;
