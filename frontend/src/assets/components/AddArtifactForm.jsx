import React, { useState } from 'react';

export default function AddArtifactForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, latitude, longitude });
    setName('');
    setDescription('');
    setLatitude('');
    setLongitude('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'absolute', top: 20, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 8 }}>
      <h3>Adaugă Artefact</h3>
      <input 
        type="text" 
        placeholder="Nume" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Descriere" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        required 
      />
      <input 
        type="number" 
        placeholder="Latitudine" 
        value={latitude} 
        onChange={(e) => setLatitude(e.target.value)} 
        required 
        step="any"
      />
      <input 
        type="number" 
        placeholder="Longitudine" 
        value={longitude} 
        onChange={(e) => setLongitude(e.target.value)} 
        required 
        step="any"
      />
      <button type="submit">Salvează Artefact</button>
    </form>
  );
}
