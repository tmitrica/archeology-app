import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

// Create root DOM node for React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render application with critical wrappers
root.render(
  <React.StrictMode>
    {/* Enable React's development-time checks */}
    <Router>
      {/* Provide client-side routing capabilities */}
      <App /> {/* Root application component */}
    </Router>
  </React.StrictMode>
);