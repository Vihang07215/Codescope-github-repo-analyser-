import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis/:id" element={<AnalysisPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#f0f0f8',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '10px'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#050508' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#050508' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
