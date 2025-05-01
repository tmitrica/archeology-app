import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import EditArtifactModal from './EditArtifactModal';
import "../styles/ArtifactList.css";

const ArtifactList = () => {
  // State management for artifacts and selected item
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const { user } = useAuth(); // Authentication context

  // Data fetching on component mount
  useEffect(() => {
    fetchArtifacts();
  }, []); // Empty dependency array = runs once on mount

  // Fetch artifacts from API
  const fetchArtifacts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/artifacts');
      const data = await response.json();
      setArtifacts(data);
    } catch (error) {
      console.error('Error fetching artifacts:', error);
     }
  };

  // Delete artifact with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest artefact?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT auth
        }
      });

      if (response.ok) {
        fetchArtifacts(); // Refresh list after deletion
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Hide component for non-admin users
  if (user?.role !== 'admin') return null;

  return (
    <div className="artifact-admin-panel">
      <h2>Artifact List</h2>
      <div className="artifact-list">
        {artifacts.map(artifact => (
          <div key={artifact.id} className="artifact-item">
            {/* Artifact information display */}
            <div className="artifact-info">
              <h3>{artifact.name}</h3>
              <p>{artifact.description}</p>
              <div className="artifact-coords">
                <span>Lat: {artifact.latitude}</span>
                <span>Lon: {artifact.longitude}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="artifact-actions">
              <button 
                onClick={() => setSelectedArtifact(artifact)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(artifact.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal conditional rendering */}
      {selectedArtifact && (
        <EditArtifactModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onUpdate={fetchArtifacts} // Simplified update handler
        />
      )}
    </div>
  );
};

export default ArtifactList;