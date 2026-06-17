import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './pages/farmer/AddProduct';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Negotiation from './pages/Negotiation';
import Invoice from './pages/Invoice';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/add-product" element={<AddProduct />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/negotiation/:productId" element={<Negotiation />} />
          <Route path="/invoice/order/:orderId" element={<Invoice />} />
          <Route path="/invoice/product/:productId" element={<Invoice />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
