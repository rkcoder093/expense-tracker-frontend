import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint from README 
      await axios.post('https://devassist360.xyz/api/auth/register/', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.username?.[0] || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">Create Account</h2>
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Username</label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition">
            Register
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;