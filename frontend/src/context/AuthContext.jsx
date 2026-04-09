// ============================================================
// context/AuthContext.jsx - Global Auth State (Context API)
// Unit 2: useContext, useState, useEffect hooks
// Unit 4: JWT-based authentication flow
// CO4: Role-based access control
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser  = localStorage.getItem('bt_user');
    const savedToken = localStorage.getItem('bt_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('bt_token', data.token);
    localStorage.setItem('bt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('bt_token', data.token);
    localStorage.setItem('bt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    setUser(null);
  };

  const isAdmin     = user?.role === 'Admin';
  const isDeveloper = user?.role === 'Developer';
  const isTester    = user?.role === 'Tester';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isDeveloper, isTester }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
