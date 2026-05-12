import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';


const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('USER'); // Default is General User
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await signup(username, email, password, role);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <h2>Create Account</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>}

        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'USER' ? 'active' : ''}`}
            onClick={() => setRole('USER')}
          >
            General User
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRole('ADMIN')}
          >
            Admin / Librarian
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
