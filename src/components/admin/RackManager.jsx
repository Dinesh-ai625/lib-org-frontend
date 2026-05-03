import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';

const RackManager = () => {
  const [racks, setRacks] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedRack, setSelectedRack] = useState(null);

  // Form states
  const [newSection, setNewSection] = useState('');
  const [newColumn, setNewColumn] = useState('');
  const [search, setSearch] = useState('');
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', genre: '', category: 'Fiction', isbn: '', totalCopies: '1', coverUrl: '', description: ''
  });

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        axios.get(`${API}/racks`),
        axios.get(`${API}/books`)
      ]);
      setRacks(Array.isArray(rRes.data) ? rRes.data : []);
      setBooks(Array.isArray(bRes.data) ? bRes.data : []);
    } catch (e) { 
      console.error('Load error:', e); 
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Drag & Drop Logic ───────────────────────────────────────────────────────
  const handleDragStart = (e, type, data) => {
    setDraggedItem({ type, data });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); 
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) setDragOverId(id);
  };

  const handleDrop = async (e, targetType, targetData) => {
    e.preventDefault();
    const source = draggedItem;
    setDraggedItem(null);
    setDragOverId(null);
    if (!source) return;

    try {
      // Rack -> Rack (Swap positions)
      if (source.type === 'rack' && targetType === 'rack') {
        if (source.data.id === targetData.id) return;
        await axios.post(`${API}/racks/swap`, { rackIdA: source.data.id, rackIdB: targetData.id });
      }
      // Book -> Rack Card (Move book to that rack)
      else if (source.type === 'book' && targetType === 'rack') {
        const targetRackBooks = books.filter(b => b.rack?.id === targetData.id);
        const nextPos = targetRackBooks.length > 0 ? Math.max(...targetRackBooks.map(b => b.position || 0)) + 1 : 0;
        await axios.patch(`${API}/books/${source.data.id}/rack`, { 
          rackId: targetData.id, 
          position: nextPos 
        });
      }
      // Book -> Book (Swap positions within shelf/rack)
      else if (source.type === 'book' && targetType === 'book') {
        if (source.data.id === targetData.id) return;
        const updates = [
          { id: source.data.id, rackId: targetData.rack?.id || null, position: targetData.position || 0 },
          { id: targetData.id, rackId: source.data.rack?.id || null, position: source.data.position || 0 }
        ];
        await axios.patch(`${API}/books/bulk`, updates);
      }
      // Book -> Shelf Row (Append to that rack)
      else if (source.type === 'book' && targetType === 'shelf') {
        const targetRackBooks = books.filter(b => b.rack?.id === targetData.id);
        const nextPos = targetRackBooks.length > 0 ? Math.max(...targetRackBooks.map(b => b.position || 0)) + 1 : 0;
        await axios.patch(`${API}/books/${source.data.id}/rack`, { 
          rackId: targetData.id, 
          position: nextPos 
        });
      }
      loadAll();
    } catch (err) {
      console.error('Operation failed:', err);
      alert('Action failed. Ensure the server is running with PATCH support.');
    }
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleDeleteRack = async (e, id, section) => {
    e.stopPropagation();
    const count = books.filter(b => b.rack?.id === id).length;
    if (count > 0) {
      alert(`Cannot delete "${section}" because it contains ${count} books. Move them first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to remove the "${section}" rack?`)) return;
    try {
      await axios.delete(`${API}/racks/${id}`);
      if (selectedRack?.id === id) setSelectedRack(null);
      loadAll();
    } catch { alert('Delete failed.'); }
  };

  const handleAddRack = async (e) => {
    e.preventDefault();
    if (!newSection || !newColumn) return;
    try {
      await axios.post(`${API}/racks`, { section: newSection, columnNumber: parseInt(newColumn) });
      setNewSection(''); setNewColumn('');
      loadAll();
    } catch { alert('Error adding rack'); }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!selectedRack) return;
    try {
      const rackBooks = books.filter(b => b.rack?.id === selectedRack.id);
      const nextPos = rackBooks.length > 0 ? Math.max(...rackBooks.map(b => b.position || 0)) + 1 : 0;
      await axios.post(`${API}/books`, { ...bookForm, rackId: selectedRack.id, position: nextPos });
      setBookForm({ title: '', author: '', genre: '', category: 'Fiction', isbn: '', totalCopies: '1', coverUrl: '', description: '' });
      setShowAddBookForm(false);
      loadAll();
    } catch { alert('Error adding book. Check ISBN.'); }
  };

  const removeBookFromRack = async (e, bookId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this book from the rack?')) return;
    try {
      await axios.patch(`${API}/books/${bookId}/rack`, { rackId: null, position: null });
      loadAll();
    } catch { alert('Update failed.'); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  const sortedRacks = [...racks].sort((a, b) => a.columnNumber - b.columnNumber);
  const filteredRacks = sortedRacks.filter(r => !search || r.section.toLowerCase().includes(search.toLowerCase()));
  
  const booksInSelected = selectedRack 
    ? books.filter(b => b.rack?.id === selectedRack.id).sort((a, b) => (a.position || 0) - (b.position || 0))
    : [];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '30px', minHeight: '85vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#111827', margin: 0 }}>Inventory Architect</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0 0 0' }}>Manage rack locations and book placements</p>
        </div>
        <input 
          type="text" className="input-field" placeholder="Search racks..." 
          style={{ width: '250px', marginBottom: 0 }} value={search} onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Racks Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredRacks.map(rack => (
            <div 
              key={rack.id}
              draggable
              onDragStart={(e) => handleDragStart(e, 'rack', rack)}
              onDragOver={(e) => handleDragOver(e, `rack-${rack.id}`)}
              onDrop={(e) => handleDrop(e, 'rack', rack)}
              onClick={() => setSelectedRack(rack)}
              style={{
                padding: '25px', borderRadius: '15px', cursor: 'grab', position: 'relative',
                background: dragOverId === `rack-${rack.id}` ? '#f3f4f6' : selectedRack?.id === rack.id ? '#f3f4f6' : '#ffffff',
                border: dragOverId === `rack-${rack.id}` ? '2px solid #10a37f' : selectedRack?.id === rack.id ? '2px solid #10a37f' : '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                transform: dragOverId === `rack-${rack.id}` ? 'scale(1.02)' : 'scale(1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <button 
                onClick={(e) => handleDeleteRack(e, rack.id, rack.section)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                DELETE
              </button>
              <div style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}>COL {rack.columnNumber}</div>
              <div style={{ color: '#111827', fontSize: '18px', fontWeight: '700', margin: '8px 0' }}>{rack.section}</div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{books.filter(b => b.rack?.id === rack.id).length} Books</span>
            </div>
          ))}

          {/* New Rack Form */}
          <div style={{ padding: '20px', borderRadius: '15px', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="New Section" className="input-field" value={newSection} onChange={e => setNewSection(e.target.value)} style={{ marginBottom: 0 }} />
            <input type="number" placeholder="Column Number" className="input-field" value={newColumn} onChange={e => setNewColumn(e.target.value)} style={{ marginBottom: 0 }} />
            <button onClick={handleAddRack} className="btn-primary" style={{ padding: '10px' }}>Create Rack</button>
          </div>
        </div>

        {/* Rack Detail / Shelves */}
        {selectedRack && (
          <div style={{ width: '550px', flexShrink: 0, background: '#ffffff', borderRadius: '24px', padding: '30px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h3 style={{ color: '#111827', margin: 0, fontSize: '24px' }}>{selectedRack.section}</h3>
                <span style={{ color: '#10a37f', fontSize: '13px' }}>Layout Management</span>
              </div>
              <button onClick={() => setSelectedRack(null)} style={{ background: '#f3f4f6', border: 'none', color: '#111827', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Shelf Stacks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {[0, 1, 2].map(shelfIdx => {
                const shelfBooks = booksInSelected.slice(shelfIdx * 6, (shelfIdx + 1) * 6);
                return (
                  <div key={shelfIdx} style={{ position: 'relative' }}>
                    <div 
                      onDragOver={(e) => handleDragOver(e, `shelf-${shelfIdx}`)}
                      onDrop={(e) => handleDrop(e, 'shelf', selectedRack)}
                      style={{ 
                        display: 'flex', gap: '12px', alignItems: 'flex-end', padding: '0 15px', minHeight: '145px',
                        backgroundColor: dragOverId === `shelf-${shelfIdx}` ? '#f0fdf4' : 'transparent',
                        borderRadius: '12px', transition: 'all 0.3s'
                      }}
                    >
                      {shelfBooks.map(book => (
                        <div 
                          key={book.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'book', book)}
                          onDragOver={(e) => handleDragOver(e, `book-${book.id}`)}
                          onDrop={(e) => handleDrop(e, 'book', book)}
                          style={{
                            width: '72px', height: '125px', borderRadius: '4px 8px 8px 2px',
                            backgroundColor: dragOverId === `book-${book.id}` ? '#10a37f' : (book.coverUrl ? 'transparent' : '#e5e7eb'),
                            backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            cursor: 'grab', boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s', position: 'relative', border: '1px solid #d1d5db',
                            transform: dragOverId === `book-${book.id}` ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
                            zIndex: dragOverId === `book-${book.id}` ? 10 : 1
                          }}
                        >
                          <button 
                            onClick={(e) => removeBookFromRack(e, book.id)}
                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >✕</button>
                          {!book.coverUrl && (
                            <div style={{ padding: '8px', fontSize: '10px', color: '#111827', fontWeight: 'bold', wordBreak: 'break-word' }}>{book.title}</div>
                          )}
                          <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px 0 0 2px' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', marginTop: '2px' }} />
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={() => setShowAddBookForm(!showAddBookForm)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', fontWeight: '600', cursor: 'pointer' }}
              >
                {showAddBookForm ? 'Hide Form' : 'Add Book to this Rack'}
              </button>
            </div>

            {showAddBookForm && (
              <form onSubmit={handleAddBook} style={{ marginTop: '20px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'grid', gap: '15px' }}>
                <input type="text" placeholder="Title" className="input-field" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required style={{ marginBottom: 0 }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                   <input type="text" placeholder="Author" className="input-field" style={{ flex: 1, marginBottom: 0 }} value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required />
                   <input type="text" placeholder="ISBN" className="input-field" style={{ flex: 1, marginBottom: 0 }} value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px' }}>Save to Shelf</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RackManager;
