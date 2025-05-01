import { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Check localStorage on initial mount for persisted session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        // Attempt to parse stored user data
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("User data parsing error:", err);
        logout(); // Clear invalid credentials
      }
    }
  }, []); // Empty dependency array = runs once on mount

  // Login handler with localStorage persistence
  const login = (userData, token) => {
    setUser(userData);
    // Store user data and token separately for security
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Logout handler with storage cleanup
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Provide auth state and methods to children
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  // Safety check for proper provider usage
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}