import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import "../styles/Login.css";

const Register = ({ onClose, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      login(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <button type="button" className="close-button" onClick={onClose}>×</button>
          <h2>Archaeology Platform Registration</h2>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">Register</button>
          <p className="auth-link">
            Already have an account? 
            <button 
              type="button" 
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
