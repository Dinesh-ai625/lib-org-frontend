import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [requestData, setRequestData] = useState({ bookTitle: '', author: '' });

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/requests/my');      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://lib-org-backend-production.up.railway.app/api/requests/submit', requestData);
      setRequestData({ bookTitle: '', author: '' });
      fetchMyRequests();
    } catch (error) {
      alert(error.response?.data || 'Error submitting request');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '10px', color: '#10a37f' }}>Request a New Book</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Can't find a book in our library? Request it here, and the librarian will review it!</p>
      
      <form onSubmit={submitRequest} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Book Title" 
          className="input-field" 
          value={requestData.bookTitle} 
          onChange={(e) => setRequestData({ ...requestData, bookTitle: e.target.value })} 
          required 
          style={{ flex: 1, marginBottom: 0 }}
        />
        <input 
          type="text" 
          placeholder="Author" 
          className="input-field" 
          value={requestData.author} 
          onChange={(e) => setRequestData({ ...requestData, author: e.target.value })} 
          required 
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Submit Request</button>
      </form>

      <h3 style={{ marginBottom: '20px', color: '#111827' }}>My Requests History</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', color: '#374151' }}>Book Title</th>
              <th style={{ padding: '12px', color: '#374151' }}>Author</th>
              <th style={{ padding: '12px', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#111827', fontWeight: '500' }}>{req.bookTitle}</td>
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
                    <button 
                      onClick={async () => {
                        if(window.confirm('Cancel this request?')) {
                          try {
                            await axios.delete(`https://lib-org-backend-production.up.railway.app/api/requests/cancel/${req.id}`);
                            fetchMyRequests();
                          } catch (error) {
                            alert('Failed to cancel request');
                          }
                        }
                      }}
                      style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p style={{color: '#6b7280', marginTop: '15px'}}>No book requests found.</p>}
      </div>
    </div>
  );
};

export default BookRequests;
