import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthContext';
import Globe from './assets/components/Globe';
import Login from './assets/components/Login';
import Register from './assets/components/Register';
import './App.css';

function MainApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Butoanele Login/Register */}
      {!user ? (
  <div className="auth-buttons">
    <button onClick={() => setShowLogin(true)}>Login</button>
    <button onClick={() => setShowRegister(true)}>Register</button>
  </div>
  ) : (
    <div className="user-info">
      <span>Welcome, {user.username}</span>
      <button onClick={logout}>Logout</button>
    </div>
  )}

      {/* Informații utilizator logat */}
      {user && (
        <div className="user-info">
          <span>Welcome, {user.username} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {/* Modale */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}

      {/* Globul */}
      <Globe />
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