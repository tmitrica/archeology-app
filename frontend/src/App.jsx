import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthContext';
import Globe from './assets/components/Globe';
import Login from './assets/components/Login';
import Register from './assets/components/Register';
import AddArtifactForm from './assets/components/AddArtifactForm';
import './App.css';

function MainApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddArtifact, setShowAddArtifact] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();

  return (
    
    <div style={{ height: '100vh', width: '100vw' }}>

      {user && (user.role === 'admin' || user.role === 'researcher') && (
        <button 
          className="add-artifact-button"
          onClick={() => setShowAddArtifact(true)}
        >
          Add Artifact
        </button>
      )}

      {showAddArtifact && (
        <AddArtifactForm
          onClose={() => setShowAddArtifact(false)}
          onAdd={() => {
            setRefreshKey(prev => prev + 1);
            setShowAddArtifact(false);
          }}
        />
      )}

      {!user && (
        <div className="auth-buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </div>
      )}

      {user && (
        <div className="user-info">
          <span>Welcome, {user.username} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      
      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      <Globe refreshKey={refreshKey} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}