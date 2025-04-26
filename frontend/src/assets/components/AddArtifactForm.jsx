import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';

const AddArtifactForm = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      onAdd();
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
          <h2>Add a new artifact</h2>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Short description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">Add</button>
        </form>
      </div>
    </div>
  );
};

export default AddArtifactForm;