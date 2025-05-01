import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';

const AddArtifactForm = ({ onClose, onAdd }) => {
  // Component state management
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth(); // Access authentication context for role-based controls

  // Main form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string inputs to numerical values first
      const parsedLat = parseFloat(latitude);
      const parsedLng = parseFloat(longitude);

      // Validation layer 1: Numerical validity check
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        throw new Error('Latitude and longitude must be valid numbers');
      }

      // Validation layer 2: Geographical coordinate boundaries
      if (parsedLat < -90 || parsedLat > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
      }

      if (parsedLng < -180 || parsedLng > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
      }

      // API call to backend with authorization
      const response = await fetch('http://localhost:3001/api/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // JWT token for authenticated requests
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          latitude: parsedLat, // Use converted numerical values
          longitude: parsedLng, // Prevent string injection
          description
        })
      });

      // Handle non-200 status responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server validation failed');
      }

      // Success workflow
      onAdd(); // Trigger parent component refresh
      onClose(); // Close modal dialog
    } catch (err) {
      // Unified error handling for both client and server errors
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Modal close button with custom handler */}
          <button type="button" className="close-button" onClick={onClose}>×</button>
          <h2>Add a new artifact</h2>
          
          {/* Error display section - only renders when error exists */}
          {error && <p className="error-message">{error}</p>}

          {/* Name input with HTML5 validation */}
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required // Native browser validation
            />
          </div>

          {/* Latitude input with triple validation: HTML5 + JS + Server */}
          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="any" // Allow decimal values
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              min="-90" // HTML5 boundary enforcement
              max="90" // Works with browser's native validation
            />
          </div>

          {/* Longitude input with same multi-layer validation */}
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              min="-180"
              max="180"
            />
          </div>

          {/* Description field with textarea for longer inputs */}
          <div className="form-group">
            <label>Short description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Submission button - triggers validation chain */}
          <button type="submit" className="auth-button">Add</button>
        </form>
      </div>
    </div>
  );
};

export default AddArtifactForm;