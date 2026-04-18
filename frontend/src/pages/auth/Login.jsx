import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BellRing,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import api, { BACKEND_BASE_URL, getStoredToken, storeToken } from '../../utils/api';
import './Login.css';

const trustPoints = [
  {
    icon: Building2,
    title: 'University-ready workflows',
    text: 'Sign in to manage facilities, bookings, incidents, and operational updates from one place.',
  },
  {
    icon: BellRing,
    title: 'Relevant notifications',
    text: 'Receive updates for approvals, ticket progress, and collaboration activity tied to your account.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure access model',
    text: 'Support for local sign-in and Google OAuth with role-based access across the platform.',
  },
];

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const authError = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const errorCode = params.get('error');

    if (errorCode === 'oauth_redirect_failed') {
      return 'Google sign-in could not be completed. Please try again.';
    }

    return '';
  }, [location.search]);

  useEffect(() => {
    if (getStoredToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const validateForm = () => {
    if (isRegistering && name.trim().length < 3) {
      return 'Please enter your full name.';
    }

    if (!email.trim()) {
      return 'Please enter your email address.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    return '';
  };

  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setError('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await api.post('/auth/register', {
          email: email.trim(),
          password,
          name: name.trim(),
        });
      }

      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      storeToken(response.data.token, rememberMe);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(`${BACKEND_BASE_URL}/oauth2/authorization/google`);
  };

  const handleModeToggle = () => {
    setIsRegistering((prev) => !prev);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-shell animate-fade-in">
        <section className="login-showcase">
          <Link to="/" className="login-brand" aria-label="Return to SmartCampus Hub home">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>
              SmartCampus<span className="hub">Hub</span>
            </span>
          </Link>

          <p className="login-kicker">Secure access to campus operations</p>
          <h1>{isRegistering ? 'Create your account for smarter campus coordination.' : 'Professional access for your campus operations workspace.'}</h1>
          <p className="login-lead">
            Designed for the Smart Campus Operations Hub assignment, this sign-in experience brings together modern
            authentication, clearer trust signals, and a cleaner workflow for local and Google-based access.
          </p>

          <div className="trust-grid">
            {trustPoints.map(({ icon: Icon, title, text }) => (
              <article key={title} className="trust-card">
                <div className="trust-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <p className="login-subtitle">{isRegistering ? 'Create your account' : 'Sign in to continue'}</p>
              <h2 className="login-title">{isRegistering ? 'Set up access' : 'Welcome back'}</h2>
              <p className="login-caption">
                {isRegistering
                  ? 'Register with an email and password, or continue with Google.'
                  : 'Use your saved credentials or continue with Google OAuth.'}
              </p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <LockKeyhole size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStandardAuth} className="login-form">
              {isRegistering && (
                <label className="form-group">
                  <span className="input-label">Full name</span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label className="form-group">
                <span className="input-label">Email address</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-group">
                <span className="input-label">Password</span>
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder={isRegistering ? 'Create a password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isRegistering && <span className="field-hint">Use at least 8 characters for better security.</span>}
              </label>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>
                <span className="support-note">
                  <UserCheck size={16} />
                  Session-aware sign-in
                </span>
              </div>

              <button type="submit" className="login-btn primary-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : isRegistering ? 'Create account' : 'Sign in'}
              </button>

              <div className="divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <button type="button" onClick={handleGoogleLogin} className="login-btn google-btn" disabled={loading}>
                <span className="google-badge" aria-hidden="true">G</span>
                {isRegistering ? 'Sign up with Google' : 'Sign in with Google'}
              </button>
            </form>

            <div className="login-footer">
              <span className="footer-text">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button type="button" className="toggle-mode-btn" onClick={handleModeToggle}>
                {isRegistering ? 'Log in' : 'Create one'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
