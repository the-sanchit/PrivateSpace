import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sn_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            document.querySelector('.sn-textarea')?.focus();
            break;
          case 's':
            e.preventDefault();
            document.querySelector('.sn-save-btn')?.click();
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  const login = (user, credentials, isDemo = false) => {
    const userData = { username: user, credentials, isDemo };
    setCurrentUser(userData);
    setDemoMode(isDemo);
    localStorage.setItem('sn_user', JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    setDemoMode(false);
    localStorage.removeItem('sn_user');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      demoMode, 
      login, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};