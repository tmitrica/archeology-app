import React, { useState } from 'react';
import "../styles/ArtifactList.css";


const EditArtifactModal = ({ artifact, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: artifact.name,
    description: artifact.description,
    latitude: artifact.latitude,
    longitude: artifact.longitude
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${artifact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="edit-artifact-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Edit</h2>
        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtifactModal;