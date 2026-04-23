import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const NavigationBar = () => {
  const { currentUser, demoMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <>
      {demoMode && (
        <div className="demo-banner">
          <span>⚡ Offline Mode</span> — Notes stored locally in your browser.
        </div>
      )}
      <nav className="sn-navbar">
        <div className="sn-nav-brand">
          <a href="/" className="sn-brand">
            <span className="sn-brand-icon">🔐</span>
            <span>PrivateSpace</span>
          </a>
        </div>

        {currentUser && (
          <div className="sn-nav-tabs">
            <Link 
              to="/dashboard" 
              className={`sn-nav-tab ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              📝 Notes
            </Link>
            <Link 
              to="/files" 
              className={`sn-nav-tab ${location.pathname === '/files' ? 'active' : ''}`}
            >
              📁 Files
            </Link>
          </div>
        )}

        <div className="sn-nav-right">
          <button
            id="theme-toggle-btn"
            className="sn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {currentUser && (
            <>
              <div className="sn-user-chip">
                <div className="sn-avatar">{initials}</div>
                <span>{currentUser.username}</span>
              </div>
              <button className="sn-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavigationBar;