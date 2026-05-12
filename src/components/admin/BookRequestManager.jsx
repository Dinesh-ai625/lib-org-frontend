import React, { useState, useEffect } from 'react';
import axios from 'axios';

import API from '../../apiConfig';


const BookRequestManager = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/requests/all`); setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${API}/requests/update/${id}`, { status });
      fetchRequests();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Manage User Book Requests</h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', color: '#374151' }}>Requested By</th>
              <th style={{ padding: '12px', color: '#374151' }}>Book Title</th>
              <th style={{ padding: '12px', color: '#374151' }}>Author</th>
              <th style={{ padding: '12px', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const requestCount = requests.filter(r => r.bookTitle.toLowerCase() === req.bookTitle.toLowerCase() && r.author.toLowerCase() === req.author.toLowerCase()).length;
              return (
                <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', color: '#374151' }}>{req.user?.username}</td>
                  <td style={{ padding: '12px', color: '#111827', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.bookTitle}
                    {requestCount > 1 && (
                      <span style={{ background: '#10a37f', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                        {requestCount} requests
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{req.author}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: req.status === 'PENDING' ? '#fef3c7' : (req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2'),
                      color: req.status === 'PENDING' ? '#92400e' : (req.status === 'APPROVED' ? '#166534' : '#991b1b'),
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => updateStatus(req.id, 'APPROVED')}
                          style={{ background: '#10a37f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, 'REJECTED')}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {requests.length === 0 && <p style={{ color: '#6b7280', marginTop: '15px' }}>No pending book requests.</p>}
      </div>
    </div>
  );
};

export default BookRequestManager;
