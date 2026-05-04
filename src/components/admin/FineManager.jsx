import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FineManager = () => {
  const [fines, setFines] = useState([]);
  const [users, setUsers] = useState([]);
  const [fineData, setFineData] = useState({ userId: '', amount: '', reason: '' });

  useEffect(() => {
    fetchFines();
    fetchUsers();
  }, []);

  const fetchFines = async () => {
    try {
const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/fines/all');      setFines(response.data);
    } catch (error) {
      console.error('Error fetching fines', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const addFine = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://lib-org-backend-production.up.railway.app/api/fines/add', fineData);
      setFineData({ userId: '', amount: '', reason: '' });
      fetchFines();
    } catch (error) {
      alert(error.response?.data || 'Error adding fine');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Manually Add Fine</h3>
      
      <form onSubmit={addFine} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '15px', marginBottom: '30px' }}>
        <select 
          className="input-field" 
          value={fineData.userId} 
          onChange={(e) => setFineData({ ...fineData, userId: e.target.value })} 
          required 
          style={{ marginBottom: 0 }}
        >
          <option value="">Select User...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Amount ($)" 
          className="input-field" 
          value={fineData.amount} 
          onChange={(e) => setFineData({ ...fineData, amount: e.target.value })} 
          required 
          step="0.01"
          style={{ marginBottom: 0 }}
        />

        <input 
          type="text" 
          placeholder="Reason (e.g. Lost Book)" 
          className="input-field" 
          value={fineData.reason} 
          onChange={(e) => setFineData({ ...fineData, reason: e.target.value })} 
          required 
          style={{ marginBottom: 0 }}
        />

        <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Add Fine</button>
      </form>

      <h3 style={{ marginBottom: '20px', color: '#111827', marginTop: '40px' }}>Fine Collection & History</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', color: '#374151' }}>User</th>
              <th style={{ padding: '12px', color: '#374151' }}>Amount</th>
              <th style={{ padding: '12px', color: '#374151' }}>Reason</th>
              <th style={{ padding: '12px', color: '#374151' }}>Date Issued</th>
              <th style={{ padding: '12px', color: '#374151' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {fines.map(fine => (
              <tr key={fine.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#111827', fontWeight: '500' }}>{fine.user?.username}</td>
                <td style={{ padding: '12px', color: '#111827' }}>${fine.amount}</td>
                <td style={{ padding: '12px', color: '#374151' }}>{fine.reason}</td>
                <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(fine.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: fine.status === 'PENDING' ? '#fee2e2' : '#dcfce7',
                    color: fine.status === 'PENDING' ? '#991b1b' : '#166534'
                  }}>
                    {fine.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FineManager;
