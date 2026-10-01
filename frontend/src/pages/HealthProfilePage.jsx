import React, { useState } from 'react';
import { Activity, Send, X, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export default function HealthProfilePage({ userId, existingHealthData, onClose, onSuccess }) {
  const [healthData, setHealthData] = useState({
    age: existingHealthData?.age || '',
    bloodGroup: existingHealthData?.bloodGroup || '',
    heartRate: existingHealthData?.heartRate || '',
    pulseRate: existingHealthData?.pulseRate || '',
    illnessDescription: existingHealthData?.illnessDescription || '',
    fileType: existingHealthData?.medicalReport?.fileType || 'None',
    fileUrl: existingHealthData?.medicalReport?.fileUrl || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setHealthData({ ...healthData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // Only send fields that have values (partial update friendly)
      const payload = { userId, ...healthData };
      
      const response = await authService.updateHealthProfile(payload);
      alert(response.message || 'Health profile updated!');
      onSuccess(response.data); 
    } catch (err) {
      setError(err.message || 'Failed to update health profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Health Profile & Medical Updates</h2>
              <p className="text-teal-100 text-xs">Update your vitals or skip if nothing has changed</p>
            </div>
          </div>
          
          {/* Skip Button */}
          <button 
            onClick={onSuccess} 
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition font-medium"
          >
            Skip for Now
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="health-form" className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Age (Optional)</label>
                <input
                  type="number"
                  name="age"
                  value={healthData.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Blood Group (Optional)</label>
                <select
                  name="bloodGroup"
                  value={healthData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Heart Rate (Optional)</label>
                <input
                  type="text"
                  name="heartRate"
                  value={healthData.heartRate}
                  onChange={handleChange}
                  placeholder="72 bpm"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Pulse Rate (Optional)</label>
                <input
                  type="text"
                  name="pulseRate"
                  value={healthData.pulseRate}
                  onChange={handleChange}
                  placeholder="75 bpm"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Update Symptoms / Illness Description</label>
              <textarea
                name="illnessDescription"
                value={healthData.illnessDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Only fill if you have new symptoms to report..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              ></textarea>
            </div>

            {/* Medical Report Update Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
              <div>
                <label className="block text-xs font-semibold uppercase text-teal-800 mb-1">Add New Report Type</label>
                <select
                  name="fileType"
                  value={healthData.fileType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                >
                  <option value="None">No New Attachment</option>
                  <option value="PDF">PDF Report</option>
                  <option value="Image">Medical Image</option>
                  <option value="X-ray">X-ray Scan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-teal-800 mb-1">Report File URL</label>
                <input
                  type="text"
                  name="fileUrl"
                  value={healthData.fileUrl}
                  onChange={handleChange}
                  placeholder="Paste file URL..."
                  className="w-full px-4 py-2.5 bg-white border border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <p className="px-6 text-xs text-gray-400 italic">💡 Note: Leaving fields blank preserves your previously saved data in the database.</p>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onSuccess}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 px-4 py-2"
          >
            Skip & Go to Dashboard
          </button>

          <button
            type="submit"
            form="health-form"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl font-semibold text-sm shadow-md hover:from-teal-700 hover:to-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Updating...' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}