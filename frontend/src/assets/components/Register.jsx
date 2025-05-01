import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import "../styles/Login.css";

const Register = ({ onClose, onSwitchToLogin }) => {
  // Component state management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Authentication context hook

  // Registration form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to registration endpoint
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      // Handle non-200 responses
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      // Auto-login workflow after successful registration
      login(data.user, data.token); // Update auth context with new user
      onClose(); // Close registration modal
    } catch (err) {
      // Unified error handling for network and server errors
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Modal close button */}
          <button type="button" className="close-button" onClick={onClose}>×</button>
          <h2>Archaeology Platform Registration</h2>
          
          {/* Error message display */}
          {error && <p className="error-message">{error}</p>}

          {/* Username input with HTML5 validation */}
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // Native browser validation
            />
          </div>

          {/* Password input with security measures */}
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Form submission button */}
          <button type="submit" className="auth-button">Register</button>

          {/* Login switch mechanism */}
          <p className="auth-link">
            Already have an account? 
            <button 
              type="button" 
              onClick={onSwitchToLogin} // Prop-drilled navigation handler
              className="link-button"
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