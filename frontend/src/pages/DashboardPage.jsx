import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Activity, LogOut, MessageSquare, FileText, User } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored session/tokens if needed, then bounce back to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-2xl text-white">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              DocBot Health Hub
            </h1>
            <p className="text-xs text-gray-400">Intelligent AI Health Assistant</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Profile & Vitals Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Your Health Profile</h2>
              <p className="text-xs text-gray-400">Managed & Synced</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your vitals and recent medical reports are securely stored and ready to be analyzed by the LLM assistant.
          </p>
          <button 
            onClick={() => alert('You can update your vitals anytime by re-logging or editing your profile.')}
            className="w-full py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 transition rounded-xl text-xs font-semibold"
          >
            View / Update Vitals
          </button>
        </div>

        {/* Right Column: AI Chatbot / Consultation Placeholder */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">DocBot AI Assistant</h2>
                <p className="text-xs text-gray-400">Ask medical questions, get preliminary cures & diet insights</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm space-y-2">
              <Activity className="w-8 h-8 mx-auto text-teal-500 animate-pulse" />
              <p className="font-medium text-gray-600">AI LLM Chat Interface is ready to be connected!</p>
              <p className="text-xs text-gray-400">Your symptom details and uploaded reports will power the recommendations here.</p>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            <input 
              type="text" 
              placeholder="Ask DocBot a health question..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-md hover:from-teal-700 hover:to-blue-700 transition">
              Send
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}