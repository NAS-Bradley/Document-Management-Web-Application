import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Login.css';

function Login() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: 'Bradley Worthen',
    email: 'bradley.worthen@nortek.com',
    password: 'demo123',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login(formData);
      toast.success(`Welcome back, ${formData.name}!`);
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleQuickLogin = (role) => {
    const demoUsers = {
      admin: {
        name: 'Bradley Worthen',
        email: 'bradley.worthen@nortek.com',
        role: 'admin'
      },
      manager: {
        name: 'Sarah Manager',
        email: 'sarah.manager@nortek.com',
        role: 'manager'
      },
      user: {
        name: 'John User',
        email: 'john.user@nortek.com',
        role: 'user'
      },
      viewer: {
        name: 'Jane Viewer',
        email: 'jane.viewer@nortek.com',
        role: 'viewer'
      }
    };

    setFormData({ ...demoUsers[role], password: 'demo123' });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">📁</div>
            <h1>Document Management</h1>
          </div>
          <p className="login-subtitle">
            AI-powered document management with intelligent tagging
          </p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="form-title">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="form-subtitle">
              {isRegistering 
                ? 'Set up your account to get started' 
                : 'Sign in to access your documents'
              }
            </p>

            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">
                <FiUser className="label-icon" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input password-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Role Selection (for demo) */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login Demo Buttons */}
          <div className="demo-login-section">
            <div className="demo-divider">
              <span>Or try demo accounts</span>
            </div>
            <div className="demo-buttons">
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('admin')}
              >
                👑 Admin Demo
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('manager')}
              >
                👔 Manager Demo
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('user')}
              >
                👤 User Demo
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('viewer')}
              >
                👁️ Viewer Demo
              </button>
            </div>
          </div>

          {/* Toggle Register/Login */}
          <div className="form-toggle">
            {isRegistering ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setIsRegistering(false)}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setIsRegistering(true)}
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-content">
              <h3>AI-Powered Tagging</h3>
              <p>Intelligent suggestions for document classification and metadata</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <div className="feature-content">
              <h3>Smart Search</h3>
              <p>Find documents quickly with advanced search and filtering</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔐</div>
            <div className="feature-content">
              <h3>Role-Based Access</h3>
              <p>Secure document management with granular permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
