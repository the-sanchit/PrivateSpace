import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await AuthService.register(username.trim(), password);
      if (result.success) {
        setSuccess(
          result.demoMode
            ? '✅ Registered in offline mode! Redirecting to login…'
            : '✅ Account created! Redirecting to login…'
        );
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Registration failed');
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
          <span className="auth-logo-icon">✨</span>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join PrivateSpace and secure your thoughts</p>
        </div>

        {error   && <div className="sn-alert sn-alert-danger">⚠️ {error}</div>}
        {success && <div className="sn-alert sn-alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="sn-form-group">
            <label className="sn-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="sn-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="sn-form-group">
            <label className="sn-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="sn-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="sn-form-group">
            <label className="sn-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="sn-input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="sn-btn sn-btn-success"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? '⏳ Creating account…' : '→ Create Account'}
          </button>
        </form>

        <div className="sn-link-row">
          Already have an account?{' '}
          <Link to="/login" className="sn-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
