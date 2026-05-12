import React, { useState } from 'react';
import axios from 'axios';

import API from '../../apiConfig';

const AdminAccountManager = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await axios.post(`${API}/auth/signup`, formData); setMessage({ text: `Account created successfully for ${formData.username}!`, type: 'success' });
      setFormData({ username: '', email: '', password: '', role: 'USER' });
    } catch (error) {
      setMessage({ text: error.response?.data || 'Failed to create account', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '30px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '20px', color: '#10a37f' }}>Create New Account</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '14px' }}>
        As an administrator, you can create new accounts for both staff (Admins) and students (Users).
      </p>

      {message.text && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '14px',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Username</label>
          <input
            type="text"
            name="username"
            className="input-field"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="e.g. staff_member"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Email Address</label>
          <input
            type="email"
            name="email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="e.g. staff@library.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Initial Password</label>
          <input
            type="password"
            name="password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Account Role</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${formData.role === 'USER' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'USER' })}
            >
              User / Student
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
            >
              Admin / Staff
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default AdminAccountManager;
