import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Demo credentials for easy testing
  const demoAccounts = [
    { role: 'Admin', email: 'admin@aams.demo', password: 'Admin@123' },
    { role: 'Faculty', email: 'faculty@aams.demo', password: 'Faculty@123' },
    { role: 'Student', email: 'student@aams.demo', password: 'Student@123' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data.data;

      // Store token
      localStorage.setItem('aams_token', token);
      localStorage.setItem('aams_user', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('aams_rememberEmail', email);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-page">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M24 10v14m-8-6l6-6 6 6" fill="currentColor" />
            </svg>
          </div>
          <h1>AAMS</h1>
          <p>Premium AI Attendance System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path fill="none" d="M22 6l-10 7L2 6" strokeWidth="2" />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24">
                <rect x="3" y="10" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M7 10V7a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="demo-section">
          <h3>Demo Accounts</h3>
          <p className="demo-info">Click to fill demo credentials:</p>
          <div className="demo-buttons">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-button"
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={loading}
              >
                <span className="demo-role">{account.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="signup-link">
              Sign up here
            </a>
          </p>
          <p className="security-note">🔒 Secure login with encrypted connection</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
