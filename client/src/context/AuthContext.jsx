import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // Migrate from localStorage to sessionStorage for securely forcing login per session
      let saved = sessionStorage.getItem('user') || localStorage.getItem('user');
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Auth fallback:', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('token') || (sessionStorage.getItem('token') || localStorage.getItem('token')) || null;
  });

  useEffect(() => {
    if (token) {
        sessionStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        sessionStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.removeItem('user');
    }
  }, [user]);

  // Global interceptor for session expiry (Added once on mount)
  useEffect(() => {
      const interceptor = axios.interceptors.response.use(
          (response) => response,
          (error) => {
              if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                  // Always clear the state so we don't think we're logged in with a bad token
                  setToken(null);
                  setUser(null);
                  
                  // Only reload/redirect if we aren't already here
                  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                  }
              }
              return Promise.reject(error);
          }
      );
      return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
      if (res.data.success && res.data.data) {
        const t = res.data.data.token;
        const u = res.data.data.user;
        
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        
        setToken(t);
        setUser(u);
        return res.data;
      } else {
        throw new Error(res.data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (res.data.success && res.data.data) {
        const t = res.data.data.token;
        const u = res.data.data.user;

        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;

        setToken(t);
        setUser(u);
        return res.data;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
