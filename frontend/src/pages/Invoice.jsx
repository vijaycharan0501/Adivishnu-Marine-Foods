import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Printer, ArrowLeft } from 'lucide-react';

const Invoice = () => {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);
  
  let data = null;

  if (orderId) {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      data = {
        id: order._id,
        date: order.createdAt,
        billedToName: order.buyer?.companyName || order.buyer?.name || 'Buyer Name',
        billedToEmail: order.buyer?.email || 'buyer@example.com',
        supplierName: order.product?.farmer?.companyName || order.product?.farmer?.name || 'Farmer Name',
        supplierEmail: order.product?.farmer?.email || 'farmer@example.com',
        productName: order.product?.name || 'Seafood Product',
        grade: order.product?.piecesPerKg || 'Standard',
        quantity: order.quantity,
        pricePerKg: order.product?.finalPrice || order.product?.expectedPrice || 0,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        title: 'SALES INVOICE'
      };
    }
  } else if (productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
      const totalAmount = product.quantity * (product.finalPrice || product.expectedPrice || 0);
      data = {
        id: product._id,
        date: product.updatedAt || product.createdAt,
        billedToName: 'Adivishnu Platform (Admin)',
        billedToEmail: 'admin@adivishnu.com',
        supplierName: product.farmer?.companyName || product.farmer?.name || 'Farmer Name',
        supplierEmail: product.farmer?.email || 'farmer@example.com',
        productName: product.name || 'Seafood Product',
        grade: product.piecesPerKg || 'Standard',
        quantity: product.quantity,
        pricePerKg: product.finalPrice || product.expectedPrice || 0,
        totalAmount: totalAmount,
        paymentStatus: 'pending', // Procurement deals are pending until admin pays farmer
        title: 'PROCUREMENT CONTRACT'
      };
    }
  }

  useEffect(() => {
    if (!data) {
      // Navigate back if data isn't loaded (in a real app, we'd fetch it here)
      navigate(-1);
    }
  }, [data, navigate]);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 shadow-md">
            <Printer className="h-4 w-4" /> Print Document
          </button>
        </div>

        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-ocean-700 tracking-tight">ADIVISHNU</h1>
              <p className="text-sm text-gray-500 mt-1">Marine Foods Procurement</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-800">{data.title}</h2>
              <p className="text-sm text-gray-500 mt-1">#{data.id.substring(0, 10).toUpperCase()}</p>
              {/* eslint-disable-next-line react-hooks/purity */}
              <p className="text-sm text-gray-500">Date: {new Date(data.date || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">Billed To:</p>
              <p className="font-medium text-gray-800">{data.billedToName}</p>
              <p className="text-sm text-gray-600">{data.billedToEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500 mb-2">Supplier / Farmer:</p>
              <p className="font-medium text-gray-800">{data.supplierName}</p>
              <p className="text-sm text-gray-600">{data.supplierEmail}</p>
            </div>
          </div>

          <table className="w-full text-left mb-10">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-3 font-semibold text-gray-800">Item Description</th>
                <th className="py-3 font-semibold text-gray-800 text-right">Quantity</th>
                <th className="py-3 font-semibold text-gray-800 text-right">Price/Kg</th>
                <th className="py-3 font-semibold text-gray-800 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-800">
                  <p className="font-medium">{data.productName}</p>
                  <p className="text-sm text-gray-500">Grade: {data.grade}</p>
                </td>
                <td className="py-4 text-right text-gray-800">{data.quantity} Kg</td>
                <td className="py-4 text-right text-gray-800">₹{data.pricePerKg}</td>
                <td className="py-4 text-right font-medium text-gray-800">₹{data.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-1/2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{data.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tax (0%)</span>
                <span className="font-medium text-gray-800">₹0</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold border-b-2 border-gray-800">
                <span className="text-gray-800">Total Due</span>
                <span className="text-ocean-700">₹{data.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 mt-2">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium ${data.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {data.paymentStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
            <p>This is a system generated document. Thank you for trading with Adivishnu Marine Foods Platform.</p>
            <p>For any queries, contact support@adivishnu.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
