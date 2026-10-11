import React from 'react';
import { User, Droplet, Thermometer, Sparkles } from 'lucide-react';

export default function VitalsCard() {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-base">Your Health Profile</h2>
          <p className="text-xs text-teal-600 font-medium">Synced with Database</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
            <Droplet className="w-3.5 h-3.5 text-red-500" />
            <span>Blood Group</span>
          </span>
          <span className="text-sm font-bold text-gray-800">Synced</span>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase flex items-center space-x-2">
            <Thermometer className="w-3.5 h-3.5 text-teal-500" />
            <span>Vitals Status</span>
          </span>
          <span className="text-sm font-bold text-teal-600">Optimal</span>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-2xl border border-teal-100 space-y-2">
        <div className="flex items-center space-x-2 text-teal-800 font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>AI Context Active</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your logged symptoms provide real-time context to DocBot for precise recommendations.
        </p>
      </div>

      <button 
        onClick={() => alert('Vitals management panel.')}
        className="w-full py-3 bg-gray-900 text-white hover:bg-gray-800 transition rounded-2xl text-xs font-bold shadow-md shadow-gray-900/10"
      >
        Manage Vitals & Reports
      </button>
    </div>
  );
}