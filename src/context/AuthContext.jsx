import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

import API from '../apiConfig';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (token && role && username) {
      setUser({ token, role, username });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password }); const { token, role, username: resUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', resUser);

      setUser({ token, role, username: resUser });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, role };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Login failed' };
    }
  };

  const signup = async (username, email, password, role) => {
    try {
      await axios.post(`${API}/auth/signup`, { username, email, password, role });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
