import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct, reset } from '../../features/products/productSlice';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    piecesPerKg: '',
    expectedPrice: '',
  });

  const { name, quantity, piecesPerKg, expectedPrice } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createProduct(formData)).unwrap()
      .then(() => {
        navigate('/farmer/dashboard');
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/farmer/dashboard" className="text-ocean-600 hover:text-ocean-700 flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="card">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
            <p className="text-sm text-gray-500 mt-1">List your seafood products to start receiving offers.</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="e.g. Vannamei Prawn"
                required
                className="input-field"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Kg)</label>
                <input
                  type="number"
                  name="quantity"
                  value={quantity}
                  onChange={onChange}
                  placeholder="e.g. 500"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pieces per Kg</label>
                <input
                  type="text"
                  name="piecesPerKg"
                  value={piecesPerKg}
                  onChange={onChange}
                  placeholder="e.g. 20-25"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Price (₹/Kg)</label>
              <input
                type="number"
                name="expectedPrice"
                value={expectedPrice}
                onChange={onChange}
                placeholder="e.g. 450"
                required
                className="input-field"
              />
            </div>

            {/* In a real app we would use a file input here for Cloudinary upload. For now we skip image. */}
            
            <div className="pt-4">
              <button type="submit" className="btn-primary w-full md:w-auto px-8">Submit Offer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
