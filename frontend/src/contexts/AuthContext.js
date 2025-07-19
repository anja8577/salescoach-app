// frontend/src/contexts/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // SSR-safe localStorage access
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  };

  const setToken = (token) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  };

  const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  };

  const setStoredUser = (userData) => {
    if (typeof window === 'undefined') return;
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user_data');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        // Verify token with backend
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            console.log('Auth initialized with user:', data.user.email);
          } else {
            // Token invalid, clear storage
            console.log('Token invalid, clearing storage');
            setToken(null);
            setStoredUser(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          setToken(null);
          setStoredUser(null);
        }
      } else {
        console.log('No token or stored user found');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data.user.email);
        setToken(data.token);
        setStoredUser(data.user);
        setUser(data.user);
        
        // Everyone goes to home page after login
        router.push('/');
        
        return { success: true };
      } else {
        console.log('Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setToken(null);
    setStoredUser(null);
    setUser(null);
    router.push('/login');
  };

  const updateUser = async (userData) => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setStoredUser(data.user);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Update failed. Please try again.' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  };

  const isAdmin = () => {
    return user && user.system_role === 'admin';
  };

  const isUser = () => {
    return user && user.system_role === 'user';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    changePassword,
    isAdmin,
    isUser,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};