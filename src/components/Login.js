import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/AuthService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AuthService.authenticate(username.trim(), password);
      if (result.success) {
        login(username.trim(), result.credentials, result.demoMode ?? false);
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sn-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🔐</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to access your secure notes</p>
        </div>

        {error && <div className="sn-alert sn-alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="sn-form-group">
            <label className="sn-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="sn-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="sn-form-group">
            <label className="sn-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="sn-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="sn-btn sn-btn-primary"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in…' : '→ Sign In'}
          </button>
        </form>

        <div className="sn-link-row">
          Don't have an account?{' '}
          <Link to="/register" className="sn-link">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
