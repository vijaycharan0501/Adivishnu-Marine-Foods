import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { Store } from 'lucide-react';
import clsx from 'clsx';

const Register = () => {
  const [role, setRole] = useState('buyer'); // default to buyer to skip role selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
  });

  const { name, email, password, confirmPassword, phone, companyName } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }
    if (isSuccess || user) {
      if (user.role === 'farmer') navigate('/farmer/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'buyer') navigate('/buyer/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
        phone,
        role,
        ...(role === 'buyer' && { companyName }),
      };
      dispatch(register(userData));
    }
  };

  if (!role) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">Choose how you want to join SeaTrade</p>
          </div>
          <div className="mt-8 flex justify-center">
            <div 
              onClick={() => setRole('buyer')}
              className="card cursor-pointer hover:border-ocean-500 hover:shadow-lg transition-all text-center group max-w-sm w-full"
            >
              <div className="mx-auto bg-ocean-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:bg-ocean-100 transition-colors">
                <Store className="h-10 w-10 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">I am a Buyer</h3>
              <p className="text-gray-500 text-sm mb-6">Browse products and place bulk orders directly.</p>
              <button className="btn-primary w-full">Sign Up as Buyer</button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            *Farmer registration is restricted to authorized company contractors only.
          </p>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link to="/login" className="font-medium text-ocean-600 hover:text-ocean-500">Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-white">
      <div className={clsx("hidden md:flex md:w-1/2 bg-cover bg-center", 
        role === 'farmer' ? "bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1470&auto=format&fit=crop')]" 
        : "bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1470&auto=format&fit=crop')]")}>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Create {role === 'farmer' ? 'Farmer' : 'Buyer'} Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join SeaTrade as a {role}</p>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Full Name"
                required
                className="input-field"
              />
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Email Address"
                required
                className="input-field"
              />
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={onChange}
                placeholder="Phone Number"
                required
                className="input-field"
              />
              {role === 'buyer' && (
                <input
                  type="text"
                  name="companyName"
                  value={companyName}
                  onChange={onChange}
                  placeholder="Company Name"
                  required
                  className="input-field"
                />
              )}
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                required
                className="input-field"
              />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm Password"
                required
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/login" className="font-medium text-ocean-600 hover:text-ocean-500">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
