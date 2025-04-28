import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import EditArtifactModal from './EditArtifactModal';
import "../styles/ArtifactList.css";

const ArtifactList = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/artifacts');
      const data = await response.json();
      setArtifacts(data);
    } catch (error) {
      console.error('Error fetching artifacts:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest artefact?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onUpdate();
        fetchArtifacts();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="artifact-admin-panel">
      <h2>Artifact List</h2>
      <div className="artifact-list">
        {artifacts.map(artifact => (
          <div key={artifact.id} className="artifact-item">
            <div className="artifact-info">
              <h3>{artifact.name}</h3>
              <p>{artifact.description}</p>
              <div className="artifact-coords">
                <span>Lat: {artifact.latitude}</span>
                <span>Lon: {artifact.longitude}</span>
              </div>
            </div>
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

      {selectedArtifact && (
        <EditArtifactModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onUpdate={() => {
            fetchArtifacts();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default ArtifactList;