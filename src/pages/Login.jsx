import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState(''); // API requires username, not email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Endpoint from README 
      const response = await axios.post('https://devassist360.xyz//api/auth/login/', { 
        username, 
        password 
      });
      
      // Response: { refresh: "...", access: "..." } 
      login(response.data.access, response.data.refresh, username); 
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">Login</h2>
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-slate-500">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;