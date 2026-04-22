import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    console.log('AuthContext Login Response:', data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (username, email, password, role, companyName) => {
    const { data } = await axios.post('/api/auth/signup', { username, email, password, role, companyName });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };


  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const addWalletMoney = async (amount) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      };
      const { data } = await axios.post('/api/auth/wallet/add', { amount }, config);
      const updatedUser = { ...user, walletBalance: data.walletBalance };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (err) {
      console.error('Add Wallet Money Error:', err.response?.data || err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('/api/auth/profile');
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Error refreshing user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, addWalletMoney, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
