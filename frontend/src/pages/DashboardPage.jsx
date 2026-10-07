import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Activity, LogOut, MessageSquare, Send, User } from 'lucide-react';
import { authService } from '../services/authService';
import API from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Chat states
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am DocBot, your intelligent AI health assistant. Tell me your symptoms or ask a health question, and I will provide first-aid advice, precautions, and remedies.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('userId');
      navigate('/login', { replace: true });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');

    // Append user message to chat window
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    try {
      setLoading(true);
      // Send message to backend chat endpoint
      const response = await API.post('/chat', { message: userMsg });
      const botReply = response.data?.reply || 'I have noted your symptoms. Please consult a qualified doctor for serious conditions.';

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      const errorMsg = err.message || 'Failed to get a response from DocBot. Please try again.';
      setMessages((prev) => [...prev, { sender: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 h-fit">
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
            Your vitals and recent medical reports are securely stored and ready to be analyzed by the LLM assistant to provide contextual guidance.
          </p>
          <button 
            onClick={() => alert('You can update your vitals anytime from your profile settings.')}
            className="w-full py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 transition rounded-xl text-xs font-semibold"
          >
            View / Update Vitals
          </button>
        </div>

        {/* Right Column: AI Chatbot Interface */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[650px]">
          
          {/* Chat Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">DocBot AI Assistant</h2>
              <p className="text-xs text-gray-400">Ask medical questions, get preliminary cures & diet insights</p>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-br-xs' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 p-4 rounded-2xl text-sm rounded-bl-xs flex items-center space-x-2">
                  <Activity className="w-4 h-4 animate-spin text-teal-600" />
                  <span>DocBot is analyzing symptoms and formulating advice...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask DocBot a health question or describe symptoms..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-md hover:from-teal-700 hover:to-blue-700 transition flex items-center space-x-1 disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </main>
    </div>
  );
}