import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on mount using HTTP-only cookie
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 is normal for unauthenticated guests
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Invalid response from server.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Invalid response from server.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/api/auth/profile', profileData);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update profile.';
      return { success: false, error: msg };
    }
  };

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
