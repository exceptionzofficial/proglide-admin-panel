import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import Users from './pages/Users';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Component (Sidebar + Content)
const AdminLayout = ({ children }) => (
  <div className="flex h-screen bg-[#f3f4f6] text-gray-800 font-sans overflow-hidden selection:bg-[rgb(157,71,10)] selection:text-white">
    <Sidebar />
    <main className="flex-1 overflow-hidden relative flex flex-col">
      {/* Top decorative loading line (static for design) */}
      <div className="h-1 bg-gray-200 w-full">
        <div className="h-full bg-[rgb(157,71,10)] w-0 animate-[load_1s_ease-out_forwards]"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/screen-guard" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="Screen Guard" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/phone-case" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="Phone Case" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/combo" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="Combo/Display" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/cc-board" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="CC Board" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/battery" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="Battery" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/center-panel" element={
          <ProtectedRoute>
            <AdminLayout><ProductManager category="Center Panel" /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout><Users /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;