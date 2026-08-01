import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Log in user using email and password
   */
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { user: loggedUser, token: loggedToken } = response.data.data;

      // Update state
      setToken(loggedToken);
      setUser(loggedUser);

      // Save to localStorage
      localStorage.setItem('token', loggedToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * Register a new user
   */
  const register = async (name, email, password, role) => {
    try {
      const response = await API.post('/auth/register', { name, email, password, role });
      const { user: registeredUser, token: registeredToken } = response.data.data;

      // Update state
      setToken(registeredToken);
      setUser(registeredUser);

      // Save to localStorage
      localStorage.setItem('token', registeredToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  /**
   * Log out currently authenticated user
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
