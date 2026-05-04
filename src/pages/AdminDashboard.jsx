import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import RackManager from '../components/admin/RackManager';
import BookManager from '../components/admin/BookManager';
import TransactionManager from '../components/admin/TransactionManager';
import FineManager from '../components/admin/FineManager';
import BookRequestManager from '../components/admin/BookRequestManager';
import AdminAccountManager from '../components/admin/AdminAccountManager';
import Profile from '../components/user/Profile';


const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('books');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'books', label: 'Library Books' },
    { id: 'racks', label: 'Manage Racks' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'fines', label: 'Fines' },
    { id: 'requests', label: 'Book Requests' },
    { id: 'accounts', label: 'Create Accounts' },
    { id: 'profile', label: 'Account Settings' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--sidebar-border)', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', color: '#10a37f' }}>Admin Portal</h2>
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
          {activeTab === 'books' && <BookManager />}
          {activeTab === 'racks' && <RackManager />}
          {activeTab === 'transactions' && <TransactionManager />}
          {activeTab === 'fines' && <FineManager />}
          {activeTab === 'requests' && <BookRequestManager />}
          {activeTab === 'accounts' && <AdminAccountManager />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
