import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem('wedding_admin_token'));

  const login = (newToken) => {
    setToken(newToken);
    sessionStorage.setItem('wedding_admin_token', newToken);
  };

  const logout = () => {
    setToken(null);
    sessionStorage.removeItem('wedding_admin_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
