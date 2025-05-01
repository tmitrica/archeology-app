import React, { useState } from 'react';
import "../styles/ArtifactList.css";

const EditArtifactModal = ({ artifact, onClose, onUpdate }) => {
  // Form state initialization with existing artifact data
  const [formData, setFormData] = useState({
    name: artifact.name,
    description: artifact.description,
    latitude: artifact.latitude,
    longitude: artifact.longitude
  });

  const [error, setError] = useState(''); // Error state for validation messages

  // Form submission handler with comprehensive validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state on new submission
    
    try {
      // Convert string inputs to numerical values
      const parsedLat = parseFloat(formData.latitude);
      const parsedLng = parseFloat(formData.longitude);

      // Client-side validation chain
      if (isNaN(parsedLat)) throw new Error('Latitude must be a valid number');
      if (isNaN(parsedLng)) throw new Error('Longitude must be a valid number');
      if (parsedLat < -90 || parsedLat > 90) throw new Error('Latitude range error');
      if (parsedLng < -180 || parsedLng > 180) throw new Error('Longitude range error');

      // Prepare updated data with type-safe coordinates
      const updatedData = {
        ...formData,
        latitude: parsedLat,
        longitude: parsedLng
      };

      // API call with authentication
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT auth
        },
        body: JSON.stringify(updatedData)
      });

      // Handle server-side validation errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      // Success workflow
      onUpdate(); // Refresh parent component
      onClose(); // Close modal
    } catch (error) {
      setError(error.message); // Display error to user
    }
  };

  // Input change handler with sanitization for coordinate fields
  const handleChange = (e) => {
    const value = e.target.name === 'latitude' || e.target.name === 'longitude' 
      ? e.target.value.replace(/[^0-9.-]/g, '') // Allow only numbers and decimals
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="edit-artifact-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Edit</h2>
        
        {/* Error display area */}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name input field */}
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description text area */}
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Latitude input with HTML5 validation attributes */}
          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="any" // Allow decimal values
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              min="-90"
              max="90"
              pattern="-?\d+(\.\d+)?" // Regex for valid number format
            />
          </div>

          {/* Longitude input with similar validation */}
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              min="-180"
              max="180"
              pattern="-?\d+(\.\d+)?"
            />
          </div>

          {/* Form submission controls */}
          <div className="form-buttons">
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtifactModal;