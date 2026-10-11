import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { authService } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-teal-500/20">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            DocBot Health Hub
          </h1>
          <p className="text-xs text-gray-400 font-medium">Intelligent AI Health Assistant & First-Aid Tracker</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-2xl transition border border-gray-200/60"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </header>
  );
}