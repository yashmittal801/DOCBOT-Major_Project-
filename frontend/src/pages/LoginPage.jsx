import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, HeartPulse, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService.js';
import HealthPopup from './HealthProfilePage.jsx';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🩺 State to control the popup and store user data
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [existingHealthData, setExistingHealthData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Call login service
      const response = await authService.login({ name, email, password });
      
      const user = response.data;
      const userId = user?._id;

      if (!userId) {
        throw new Error('User ID not received from server.');
      }

      

      // 🩺 Save ID and existing profile data, then trigger the Health Popup
      setLoggedInUserId(userId);
      setExistingHealthData(user.healthProfile || null);
      setShowHealthPopup(true);

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=2000&q=80')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/90 via-blue-950/85 to-slate-950/90 backdrop-blur-xs"></div>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white text-center relative">
          <div className="absolute top-4 left-4 bg-white/10 p-2 rounded-full backdrop-blur-sm">
            <HeartPulse className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Welcome Back</h1>
          <p className="text-teal-100 text-xs mt-1">Sign in to your DocBot Account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Yash Mittal"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yash@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md hover:from-teal-700 hover:to-blue-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* 🩺 THE HEALTH POPUP MODAL */}
      {showHealthPopup && (
        <HealthPopup 
          userId={loggedInUserId} 
          existingHealthData={existingHealthData}
          onClose={() => setShowHealthPopup(false)}
          onSuccess={(updatedData) => {
            alert('Welcome to DocBot!');
            navigate('/dashboard'); // Routes user to the main dashboard after submitting or skipping
          }}
        />
      )}

    </div>
  );
}