import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Uncomment when you create your dashboard
import HealthProfilePage from './pages/HealthProfilePage'; // Uncomment if using dedicated health page route

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        { <Route path="/dashboard" element={<DashboardPage />} /> }
        { <Route path="/health-profile" element={<HealthProfilePage />} /> }

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}