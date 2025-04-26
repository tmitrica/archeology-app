import React, { useState, useEffect } from 'react';
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
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Butoanele Login/Register */}
      {!user && (
        <div className="auth-buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </div>
      )}

      {/* Mesaj bun venit + Logout */}
      {user && (
        <div className="user-info">
          <span>Welcome, {user.username} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {/* Modalele */}
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

      {/* Componenta Globe */}
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