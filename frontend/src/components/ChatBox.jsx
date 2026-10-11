import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Activity, Paperclip, X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API from '../services/api';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I am DocBot, your intelligent AI health assistant. Tell me your symptoms or select a quick prompt below.' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const quickPrompts = [
    "I have a sudden headache and dizziness 🤕",
    "Home remedies for a sore throat 🍵",
    "First-aid steps for a minor burn 🔥"
  ];

  // Fetch full chat history from MongoDB when component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get('/chat/history');
        const pastChats = response.data?.data?.history || [];

        if (pastChats.length > 0) {
          const formattedMessages = [];
          pastChats.forEach((chat) => {
            formattedMessages.push({ 
              sender: 'user', 
              text: chat.message, 
              reportUrl: chat.reportUrl 
            });
            formattedMessages.push({ 
              sender: 'bot', 
              text: chat.reply 
            });
          });

          setMessages((prev) => [prev[0], ...formattedMessages]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setFetchingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() && !selectedFile) return;
    if (loading) return;

    const displayMsg = selectedFile ? `${msg || 'Please analyze this report'} [Attached: ${selectedFile.name}]` : msg;
    setInputMessage('');
    
    const fileObjectURL = selectedFile ? URL.createObjectURL(selectedFile) : null;

    setMessages((prev) => [
      ...prev, 
      { sender: 'user', text: displayMsg, reportUrl: fileObjectURL }
    ]);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('message', msg || 'Please analyze this report');
      if (selectedFile) {
        formData.append('report', selectedFile);
      }

      const response = await API.post('/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const botReply = response.data?.data?.reply || response.data?.reply || 'Please consult a qualified medical professional.';
      
      setSelectedFile(null);
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Failed to get a response from DocBot.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-2 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white flex flex-col justify-between h-[720px]">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">DocBot Assistant & Report Analyzer</h2>
            <p className="text-xs text-gray-400">History synced with secure database</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {fetchingHistory && (
          <div className="text-center text-xs text-gray-400 py-2">Loading past consultations...</div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-br-xs font-medium' 
                : 'bg-gray-50 text-gray-800 rounded-bl-xs border border-gray-100 prose prose-sm max-w-none'
            }`}>
              {msg.reportUrl && (
                <div className="mb-2 flex items-center space-x-2 bg-white/20 p-2 rounded-xl text-xs">
                  <FileText className="w-4 h-4" />
                  <a href={msg.reportUrl} target="_blank" rel="noopener noreferrer" className="underline truncate">
                    View Attached Report
                  </a>
                </div>
              )}
              {msg.sender === 'bot' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 text-gray-500 p-4 rounded-3xl text-sm rounded-bl-xs flex items-center space-x-3">
              <Activity className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-xs font-semibold">DocBot is analyzing your request...</span>
            </div>
          </div>
        )}
      </div>

      {/* File Preview Bar */}
      {selectedFile && (
        <div className="flex items-center justify-between bg-teal-50 border border-teal-100 px-4 py-2 rounded-2xl mb-2 text-xs text-teal-800">
          <span className="font-medium truncate">Selected File: {selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)} className="text-teal-600 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="py-2 flex overflow-x-auto space-x-2 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3.5 py-2 rounded-xl transition border border-teal-100/60 shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-2 pt-3 border-t border-gray-100 flex items-center space-x-2">
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-3.5 rounded-2xl text-gray-600 transition flex items-center justify-center">
          <Paperclip className="w-5 h-5" />
          <input 
            type="file" 
            accept="image/*,application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="hidden" 
          />
        </label>

        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your symptoms or report..." 
          className="flex-1 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
        />
        
        <button 
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-teal-500/25 hover:from-teal-700 hover:to-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}