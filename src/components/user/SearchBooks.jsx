import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBooks = ({ activeTransactions = [], fetchMyTransactions }) => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchFavorites();
    fetchMyRequests();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchBooks();
    }, 500);

    return () => clearTimeout(timer);
  }, [query, filterBy]);

  const searchBooks = async () => {
    try {
const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/books/search', {        params: { query, filterBy }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error searching books', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/favorites/my');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites', error);
    }
  };

  const toggleFavorite = async (bookId) => {
    const isFav = favorites.some(f => f.book.id === bookId);
    try {
      if (isFav) {
        await axios.delete(`https://lib-org-backend-production.up.railway.app/api/favorites/remove/${bookId}`);
      } else {
        await axios.post('https://lib-org-backend-production.up.railway.app/api/favorites/add', { bookId });
      }
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get('https://lib-org-backend-production.up.railway.app/api/requests/my');
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  const submitBookRequest = async (book) => {
    try {
      await axios.post('https://lib-org-backend-production.up.railway.app/api/requests/submit', { bookTitle: book.title, author: book.author });
      alert('Book request submitted successfully!');
      fetchMyRequests();
    } catch (error) {
      alert('Failed to request book');
    }
  };

  const cancelBookRequest = async (requestId) => {
    try {
      await axios.delete(`https://lib-org-backend-production.up.railway.app/api/requests/cancel/${requestId}`);
      alert('Request cancelled successfully!');
      fetchMyRequests();
    } catch (error) {
      alert('Failed to cancel request');
    }
  };

  const requestBorrow = async (bookId) => {
    try {
      await axios.post(`https://lib-org-backend-production.up.railway.app/api/transactions/user-borrow/${bookId}`);
      alert('Book borrowed successfully!');
      if (fetchMyTransactions) fetchMyTransactions();
      searchBooks(); // refresh copies count
    } catch (error) {
      alert(error.response?.data || 'Failed to borrow book');
    }
  };

  const returnBook = async (txId) => {
    try {
      await axios.post(`https://lib-org-backend-production.up.railway.app/api/transactions/user-return/${txId}`);
      alert('Book returned successfully!');
      if (fetchMyTransactions) fetchMyTransactions();
      searchBooks(); // refresh copies count
    } catch (error) {
      alert('Failed to return book');
    }
  };

  if (selectedBook) {
    const isFav = favorites.some(f => f.book.id === selectedBook.id);
    const activeTx = activeTransactions.find(tx => tx.book.id === selectedBook.id);
    const existingRequest = myRequests.find(r => r.bookTitle === selectedBook.title && r.author === selectedBook.author);
    
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '30px', marginTop: '20px' }}>
        <button onClick={() => setSelectedBook(null)} style={{ background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Search Results
        </button>
        
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '350px' }}>
            {selectedBook.coverUrl ? (
              <img src={selectedBook.coverUrl} alt={selectedBook.title} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: '100%', height: '450px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                <span style={{ color: '#9ca3af' }}>No Cover Available</span>
              </div>
            )}
          </div>
          
          <div style={{ flex: '2', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '10px' }}>{selectedBook.title}</h1>
            <p style={{ fontSize: '1.2rem', color: '#10a37f', marginBottom: '25px' }}>{selectedBook.author}</p>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              {activeTx ? (
                <button onClick={() => returnBook(activeTx.id)} className="btn-primary" style={{ background: '#10a37f', padding: '10px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Return Book
                </button>
              ) : selectedBook.availableCopies === 0 ? (
                existingRequest ? (
                  <button onClick={() => cancelBookRequest(existingRequest.id)} className="btn-primary" style={{ background: '#ef4444', padding: '10px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Cancel Request
                  </button>
                ) : (
                  <button onClick={() => submitBookRequest(selectedBook)} className="btn-primary" style={{ background: '#f59e0b', padding: '10px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Request Book
                  </button>
                )
              ) : (
                <button 
                  onClick={() => requestBorrow(selectedBook.id)} 
                  className="btn-primary" 
                  style={{ padding: '10px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Borrow Book
                </button>
              )}
              <button onClick={() => toggleFavorite(selectedBook.id)} style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                {isFav ? 'Remove from Library' : 'Add to My Library'}
              </button>
            </div>
            
            <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <span style={{ display: 'inline-block', paddingBottom: '10px', borderBottom: '2px solid #10a37f', color: '#10a37f', fontWeight: 'bold' }}>ABOUT BOOK</span>
            </div>
            
            <p style={{ color: '#374151', lineHeight: '1.6', fontSize: '15px', marginBottom: '40px' }}>
              {selectedBook.description || 'No description available for this book.'}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: '#4b5563', fontSize: '14px' }}>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Category:</strong> {selectedBook.category}</div>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Genre:</strong> {selectedBook.genre}</div>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>ISBN:</strong> {selectedBook.isbn}</div>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Availability:</strong> {selectedBook.availableCopies} / {selectedBook.totalCopies} Copies</div>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Location:</strong> {selectedBook.rack ? `${selectedBook.rack.section} - Col ${selectedBook.rack.columnNumber}` : 'Unassigned'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#60a5fa' }}>Browse Library</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search..." 
          className="input-field" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 3 }}
        />
        <select 
          className="input-field" 
          value={filterBy} 
          onChange={(e) => setFilterBy(e.target.value)}
          style={{ flex: 1, backgroundColor: '#ffffff', color: '#111827' }}
        >
          <option value="">By Title</option>
          <option value="author">By Author</option>
          <option value="genre">By Genre</option>
          <option value="category">By Category</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {books.map(book => {
          const isFav = favorites.some(f => f.book.id === book.id);
          return (
            <div key={book.id} className="book-card" style={{ padding: '0', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <button 
                onClick={() => toggleFavorite(book.id)}
                className={`favorite-toggle ${isFav ? 'active' : ''}`}
                title={isFav ? "Remove from favorites" : "Add to favorites"}
                style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  zIndex: 10, 
                  background: isFav ? '#ef4444' : 'rgba(255,255,255,0.8)', 
                  border: '1px solid #e5e7eb',
                  color: isFav ? 'white' : '#9ca3af',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isFav ? '★' : '☆'}
              </button>
              
              {book.coverUrl ? (
                <div style={{ width: '100%', height: '300px', backgroundColor: '#f3f4f6', overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => setSelectedBook(book)}>
                  {book.availableCopies === 0 && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid white' }}>UNAVAILABLE</span>
                    </div>
                  )}
                  <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '300px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => setSelectedBook(book)}>
                  {book.availableCopies === 0 && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid white' }}>UNAVAILABLE</span>
                    </div>
                  )}
                  <span style={{ color: '#9ca3af' }}>No Cover</span>
                </div>
              )}
              
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ color: '#111827', marginBottom: '5px', paddingRight: '10px', cursor: 'pointer' }} onClick={() => setSelectedBook(book)}>{book.title}</h4>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>By {book.author}</p>
                
                <div style={{ marginTop: 'auto' }}>
                  <p style={{ color: '#9ca3af', fontSize: '12px' }}>{book.genre} | {book.category}</p>
                  <p style={{ 
                    marginTop: '5px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    color: book.availableCopies > 0 ? '#10a37f' : '#ef4444' 
                  }}>
                    {book.availableCopies > 0 ? `Available (${book.availableCopies})` : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {books.length === 0 && <p style={{color: '#94a3b8'}}>No books found matching your criteria.</p>}
      </div>
    </div>
  );
};

export default SearchBooks;
