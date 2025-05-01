import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import "../styles/Login.css";

const Login = ({ onClose, onSwitchToRegister }) => {
  // State management for form inputs and error messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Authentication context hook

  // Form submission handler with authentication flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to login endpoint
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      // Handle non-successful HTTP responses
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // Authentication success workflow
      login(data.user, data.token); // Update global auth state
      onClose(); // Close login modal
    } catch (err) {
      // Unified error handling for network issues and API errors
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Modal close button */}
          <button type="button" className="close-button" onClick={onClose}>×</button>
          <h2>Archaeology Platform Login</h2>
          
          {/* Error message display section */}
          {error && <p className="error-message">{error}</p>}

          {/* Username input group */}
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // HTML5 validation
            />
          </div>
          
          {/* Password input group */}
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Form submission controls */}
          <button type="submit" className="auth-button">Login</button>
          
          {/* Registration switch mechanism */}
          <p className="auth-link">
            Don't have an account? 
            <button 
              type="button" 
              onClick={onSwitchToRegister} // Prop-drilled navigation handler
              className="link-button"
            >
              Register here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;