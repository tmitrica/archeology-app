import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthContext';
import Globe from './assets/components/Globe';
import Login from './assets/components/Login';
import Register from './assets/components/Register';
import AddArtifactForm from './assets/components/AddArtifactForm';
import ArtifactList from './assets/components/ArtifactList';
import './assets/styles/App.css';

function MainApp() {
  // State management for UI visibility and data refresh
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddArtifact, setShowAddArtifact] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Forces Globe component refresh
  const { user, logout } = useAuth();

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Conditional Add Artifact button for authorized roles */}
      {user && (user.role === 'admin' || user.role === 'researcher') && (
        <button 
          className="add-artifact-button"
          onClick={() => setShowAddArtifact(true)}
        >
          Add Artifact
        </button>
      )}

      {/* Artifact creation modal */}
      {showAddArtifact && (
        <AddArtifactForm
          onClose={() => setShowAddArtifact(false)}
          onAdd={() => {
            setRefreshKey(prev => prev + 1); // Refresh globe markers
            setShowAddArtifact(false);
          }}
        />
      )}

      {/* Authentication buttons for logged out users */}
      {!user && (
        <div className="auth-buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </div>
      )}

      {/* User status and logout controls */}
      {user && (
        <div className="user-info">
          <span>Welcome, {user.username} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {/* Authentication modals with switch capability */}
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

      {/* Main 3D globe component with refresh control */}
      <Globe refreshKey={refreshKey} />
    </div>
  );
}

// Root application component with authentication context
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      {/* Artifact list for admin users (outside MainApp for layout purposes) */}
      <ArtifactList onUpdate={() => setRefreshKey(prev => prev + 1)} />
    </AuthProvider>
  );
}