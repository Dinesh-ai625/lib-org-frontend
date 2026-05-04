import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import SearchBooks from '../components/user/SearchBooks';
import BookRequests from '../components/user/BookRequests';
import Favorites from '../components/user/Favorites';
import Profile from '../components/user/Profile';

const API = "https://lib-org-backend-production.up.railway.app/api";

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('search');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [transactions, setTransactions] = useState([]);
  const [fines, setFines] = useState([]);

  useEffect(() => {
    fetchMyTransactions();
    fetchMyFines();
  }, []);

  const fetchMyTransactions = async () => {
    try {
const response = await axios.get(`${API}/transactions/my`);      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const fetchMyFines = async () => {
    try {
      const response = await axios.get(`${API}/fines/my`);
      setFines(response.data);
    } catch (error) {
      console.error('Error fetching fines', error);
    }
  };

  const payFine = async (fineId) => {
    try {
      await axios.post(`${API}/fines/pay/${fineId}`);
      fetchMyFines(); // refresh
      alert('Fine paid successfully!');
    } catch (error) {
      alert(error.response?.data || 'Error paying fine');
    }
  };

  const activeTransactions = transactions.filter(tx => tx.status === 'BORROWED');
  const pastTransactions = transactions.filter(tx => tx.status === 'RETURNED' || tx.status === 'OVERDUE');
  
  const pendingFines = fines.filter(f => f.status === 'PENDING');
  const paidFines = fines.filter(f => f.status === 'CLEARED');

  const menuItems = [
    { id: 'search', label: 'Search Library' },
    { id: 'favorites', label: 'My Favorites' },
    { id: 'borrowed', label: 'Active Borrowings' },
    { id: 'history', label: 'Reading History' },
    { id: 'fines', label: 'My Fines' },
    { id: 'requests', label: 'Book Requests' },
    { id: 'profile', label: 'Account Settings' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--sidebar-border)', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', color: '#10a37f' }}>My Library</h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Welcome, {user?.username}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '15px', borderTop: '1px solid var(--sidebar-border)' }}>
          <button 
            onClick={logout} 
            className="sidebar-item" 
            style={{ width: 'calc(100% - 16px)', border: 'none', background: 'transparent', color: '#ef4444' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>
            {menuItems.find(m => m.id === activeTab)?.label}
          </h1>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'search' && <SearchBooks activeTransactions={activeTransactions} fetchMyTransactions={fetchMyTransactions} />}
          {activeTab === 'favorites' && <Favorites />}
          {activeTab === 'requests' && <BookRequests />}
          {activeTab === 'profile' && <Profile />}

          {activeTab === 'borrowed' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>Currently Reading</h3>
              {activeTransactions.length === 0 ? <p style={{color: '#6b7280'}}>You have no active borrowed books.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {activeTransactions.map(tx => (
                  <div key={tx.id} className="book-card" style={{ padding: '15px' }}>
                    {tx.book?.coverUrl && (
                      <div style={{ width: '100%', height: '150px', marginBottom: '10px', overflow: 'hidden', borderRadius: '4px' }}>
                        <img src={tx.book.coverUrl} alt={tx.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <h4 style={{ color: '#111827', marginBottom: '5px' }}>{tx.book?.title}</h4>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>By {tx.book?.author}</p>
                    <p style={{ fontSize: '13px', color: '#b45309' }}>Due: {tx.dueDate}</p>
                    <button 
                      onClick={async () => {
                        try {
                          await axios.post(`${API}/transactions/user-return/${tx.id}`);
                          fetchMyTransactions();
                          alert('Book returned successfully!');
                        } catch (error) {
                          alert('Error returning book');
                        }
                      }}
                      style={{ marginTop: '10px', width: '100%', background: '#10a37f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Return Book
                    </button>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px', color: '#8b5cf6' }}>Reading History</h3>
              {pastTransactions.length === 0 ? <p style={{color: '#6b7280'}}>You have no returned books.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                      <th style={{ padding: '12px', color: '#374151' }}>Book Title</th>
                      <th style={{ padding: '12px', color: '#374151' }}>Author</th>
                      <th style={{ padding: '12px', color: '#374151' }}>Issue Date</th>
                      <th style={{ padding: '12px', color: '#374151' }}>Return Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px' }}>{tx.book?.title}</td>
                        <td style={{ padding: '12px' }}>{tx.book?.author}</td>
                        <td style={{ padding: '12px' }}>{tx.issueDate}</td>
                        <td style={{ padding: '12px', color: '#10a37f' }}>{tx.returnDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'fines' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', color: '#ef4444' }}>Pending Fines</h3>
                {pendingFines.length === 0 ? <p style={{color: '#6b7280'}}>Hooray! No pending fines.</p> : (
                  <div>
                    {pendingFines.map(fine => (
                      <div key={fine.id} className="book-card" style={{ padding: '15px', background: '#fef2f2', border: '1px solid #fee2e2', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ color: '#b91c1c', marginBottom: '5px' }}>${fine.amount}</h4>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>{fine.reason} - {new Date(fine.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={() => payFine(fine.id)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Paid History</h3>
                {paidFines.length === 0 ? <p style={{color: '#6b7280'}}>No fine history.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                        <th style={{ padding: '8px', color: '#374151' }}>Amount</th>
                        <th style={{ padding: '8px', color: '#374151' }}>Reason</th>
                        <th style={{ padding: '8px', color: '#374151' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidFines.map(fine => (
                        <tr key={fine.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px' }}>${fine.amount}</td>
                          <td style={{ padding: '8px', fontSize: '14px' }}>{fine.reason}</td>
                          <td style={{ padding: '8px', color: '#10a37f' }}>Cleared</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
