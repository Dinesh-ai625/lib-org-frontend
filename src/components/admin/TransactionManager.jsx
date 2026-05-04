import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [issueData, setIssueData] = useState({ bookId: '', userId: '' });

  useEffect(() => {
    fetchTransactions();
    fetchBooks();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/transactions/all');      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books', error);
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

  const issueBook = async (e) => {
    e.preventDefault();
    try {
await axios.post('https://lib-org-backend-production.up.railway.app/api/transactions/issue', {        bookId: parseInt(issueData.bookId),
        userId: parseInt(issueData.userId)
      });
      setIssueData({ bookId: '', userId: '' });
      fetchTransactions();
      fetchBooks(); // Refresh available copies
    } catch (error) {
      alert(error.response?.data || 'Error issuing book');
    }
  };

  const returnBook = async (transactionId) => {
    try {
      await axios.post(`https://lib-org-backend-production.up.railway.app/api/transactions/return/${transactionId}`);
      fetchTransactions();
      fetchBooks();
    } catch (error) {
      alert(error.response?.data || 'Error returning book');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Issue New Book</h3>
      
      <form onSubmit={issueBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', marginBottom: '30px' }}>
        <select 
          className="input-field" 
          value={issueData.userId} 
          onChange={(e) => setIssueData({ ...issueData, userId: e.target.value })} 
          required 
          style={{ marginBottom: 0 }}
        >
          <option value="">Select User...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
          ))}
        </select>

        <select 
          className="input-field" 
          value={issueData.bookId} 
          onChange={(e) => setIssueData({ ...issueData, bookId: e.target.value })} 
          required 
          style={{ marginBottom: 0 }}
        >
          <option value="">Select Book...</option>
          {books.map(book => (
            <option key={book.id} value={book.id} disabled={book.availableCopies === 0}>
              {book.title} (Available: {book.availableCopies})
            </option>
          ))}
        </select>

        <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Issue Book</button>
      </form>

      <h3 style={{ marginBottom: '20px', color: '#111827', marginTop: '40px' }}>Transaction History</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', color: '#374151' }}>Book Title</th>
              <th style={{ padding: '12px', color: '#374151' }}>User</th>
              <th style={{ padding: '12px', color: '#374151' }}>Issue Date</th>
              <th style={{ padding: '12px', color: '#374151' }}>Due Date</th>
              <th style={{ padding: '12px', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px', color: '#374151' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', color: '#111827', fontWeight: '500' }}>{tx.book?.title}</td>
                <td style={{ padding: '12px', color: '#374151' }}>{tx.user?.username}</td>
                <td style={{ padding: '12px', color: '#6b7280' }}>{tx.issueDate}</td>
                <td style={{ padding: '12px', color: '#6b7280' }}>{tx.dueDate}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: tx.status === 'BORROWED' ? '#fef3c7' : (tx.status === 'RETURNED' ? '#dcfce7' : '#fee2e2'),
                    color: tx.status === 'BORROWED' ? '#92400e' : (tx.status === 'RETURNED' ? '#166534' : '#991b1b'),
                  }}>
                    {tx.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {tx.status === 'BORROWED' && (
                    <button 
                      onClick={() => returnBook(tx.id)} 
                      style={{ background: 'transparent', color: '#10a37f', border: '1px solid #10a37f', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Mark Returned
                    </button>
                  )}
                  {tx.status === 'RETURNED' && (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>Returned {tx.returnDate}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionManager;
