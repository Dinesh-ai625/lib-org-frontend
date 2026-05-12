import React, { useState, useEffect } from 'react';
import axios from 'axios';

import API from '../../apiConfig';


const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API}/favorites/my`); setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites', error);
    }
  };

  const removeFavorite = async (bookId) => {
    try {
      await axios.delete(`${API}/favorites/remove/${bookId}`);
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite', error);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '20px', color: '#ef4444' }}>My Favorites</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {favorites.map(fav => (
          <div key={fav.id} className="book-card" style={{ padding: '15px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative' }}>
            <button
              onClick={() => removeFavorite(fav.book.id)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove from favorites"
            >
              ★
            </button>
            <h4 style={{ color: '#111827', marginBottom: '5px', paddingRight: '30px' }}>{fav.book.title}</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>By {fav.book.author}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Genre: {fav.book.genre}</p>
          </div>
        ))}
        {favorites.length === 0 && <p style={{ color: '#6b7280' }}>You haven't saved any books to your favorites yet.</p>}
      </div>
    </div>
  );
};

export default Favorites;
