import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [racks, setRacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [addError, setAddError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '', author: '', genre: '', category: '', isbn: '', totalCopies: '', rackId: '', coverUrl: '', description: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchRacks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/books');
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching books', error);
    }
  };

  const fetchRacks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/racks');
      setRacks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching racks', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'isbn') setAddError('');
  };

  const addBook = async (e) => {
    e.preventDefault();
    setAddError('');

    const isDuplicate = books.some(b => b.isbn === formData.isbn.trim());
    if (isDuplicate) {
      setAddError(`ISBN "${formData.isbn}" already exists.`);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/books', {
        ...formData,
        totalCopies: parseInt(formData.totalCopies),
        rackId: formData.rackId ? parseInt(formData.rackId) : null
      });
      setFormData({ title: '', author: '', genre: '', category: '', isbn: '', totalCopies: '', rackId: '', coverUrl: '', description: '' });
      fetchBooks();
      setShowAddForm(false);
      alert('Book added successfully!');
    } catch (error) {
      setAddError('Failed to add book. Please check your data.');
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book from the system?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/books/${id}`);
      fetchBooks();
      setSelectedBook(null);
      alert('Book removed successfully');
    } catch (error) {
      alert('Error deleting book. It might be linked to active transactions.');
    }
  };

  const filteredBooks = books.filter(book => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (searchBy === 'title') return book.title?.toLowerCase().includes(q);
    if (searchBy === 'author') return book.author?.toLowerCase().includes(q);
    if (searchBy === 'isbn') return book.isbn?.toLowerCase().includes(q);
    return true;
  });

  if (selectedBook) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '30px' }}>
        <button onClick={() => setSelectedBook(null)} style={{ background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
          ← Back to Library
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
              <button 
                onClick={() => deleteBook(selectedBook.id)} 
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Remove Book
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
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Inventory:</strong> {selectedBook.availableCopies} / {selectedBook.totalCopies} Copies</div>
              <div><strong style={{ color: '#111827', display: 'inline-block', width: '100px' }}>Location:</strong> {selectedBook.rack ? `${selectedBook.rack.section} - Col ${selectedBook.rack.columnNumber}` : 'Unassigned'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', color: '#111827' }}>Library Books</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary"
          style={{ width: 'auto' }}
        >
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#10a37f' }}>Register New Book</h3>
          <form onSubmit={addBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" name="title" placeholder="Title" className="input-field" value={formData.title} onChange={handleChange} required />
            <input type="text" name="author" placeholder="Author" className="input-field" value={formData.author} onChange={handleChange} required />
            <input type="text" name="genre" placeholder="Genre" className="input-field" value={formData.genre} onChange={handleChange} required />
            <input type="text" name="category" placeholder="Category" className="input-field" value={formData.category} onChange={handleChange} required />
            <input type="text" name="isbn" placeholder="ISBN (Unique)" className="input-field" value={formData.isbn} onChange={handleChange} required />
            <input type="number" name="totalCopies" placeholder="Total Copies" className="input-field" value={formData.totalCopies} onChange={handleChange} required />
            <input type="text" name="coverUrl" placeholder="Cover Image URL (optional)" className="input-field" value={formData.coverUrl} onChange={handleChange} style={{ gridColumn: 'span 2' }} />
            
            <select name="rackId" className="input-field" value={formData.rackId} onChange={handleChange} required style={{ gridColumn: 'span 2' }}>
              <option value="">Select Rack Location...</option>
              {racks.map(rack => (
                <option key={rack.id} value={rack.id}>{rack.section} - Column {rack.columnNumber}</option>
              ))}
            </select>

            <textarea name="description" placeholder="Book Description" className="input-field" value={formData.description} onChange={handleChange} style={{ gridColumn: 'span 2', minHeight: '80px' }} />

            {addError && <div style={{ gridColumn: 'span 2', color: '#ef4444', fontSize: '13px', marginBottom: '10px' }}>{addError}</div>}

            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Add Book to Collection</button>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px' }}>
        <input 
          type="text" 
          placeholder={`Search by ${searchBy}...`} 
          className="input-field" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 3, marginBottom: 0 }}
        />
        <select 
          className="input-field" 
          value={searchBy} 
          onChange={e => setSearchBy(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <option value="title">By Title</option>
          <option value="author">By Author</option>
          <option value="isbn">By ISBN</option>
        </select>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedBook(book)}>
            <div style={{ height: '320px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Cover</div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', padding: '10px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: book.availableCopies > 0 ? '#10a37f' : '#ef4444' }}>
                  {book.availableCopies} / {book.totalCopies} Available
                </p>
              </div>
            </div>
            <div style={{ padding: '15px' }}>
              <h4 style={{ color: '#111827', fontSize: '16px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h4>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>By {book.author}</p>
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                <span style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#374151' }}>{book.genre}</span>
                <span style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#374151' }}>{book.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No books found in the collection.
        </div>
      )}
    </div>
  );
};

export default BookManager;
