import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Uses from './components/Uses';
import Download from './components/Download';
import UploadsDashboard from './components/UploadsDashboard';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        
        {/* SaaS Ambient Lighting & Grid Backdrop */}
        <div className="ambient-bg">
          <div className="ambient-grid" />
          <div className="ambient-light-1" />
          <div className="ambient-light-2" />
        </div>

        <div className="min-h-screen flex flex-col justify-between relative text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
          {/* Floating Glass Navbar with Auth Dropdown */}
          <Navbar />

          {/* Main Content Area */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12 relative z-10 flex-1">
            <AnimatedRoutes />
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/uses" element={<Uses />} />
        <Route path="/download/:uuid" element={<Download />} />

        {/* Public-Only Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Authenticated Routes */}
        <Route
          path="/uploads"
          element={
            <ProtectedRoute>
              <UploadsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
