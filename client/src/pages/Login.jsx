import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setAuth, setError, clearError } from '../redux/authSlice';
import { saveAuth } from '../services/api';
import api from '../services/api';
import Loader from '../components/Loader';

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { token, loading } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const params = new URLSearchParams(search);
  const redirect = params.get('redirect') || '/';

  if (token) {
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearError());

    if (!email || !password) {
      setFormError('Please enter email and password');
      return;
    }

    dispatch(setError(null));
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user } = res.data;
      dispatch(setAuth({ token: newToken, user }));
      saveAuth({ token: newToken, user });
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(setError(msg));
      setFormError(msg);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Log in to your Ethnic Threads account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {formError && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              <span style={styles.errorText}>{formError}</span>
            </div>
          )}

          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            Password
            <div style={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.toggleBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? <Loader size={20} /> : 'Log in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #faf0e6 0%, #e8d5c4 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #e5e4e7',
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b6375',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#6b6375',
  },
  inputWrap: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    fontSize: 15,
    background: '#fafafa',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  toggleBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    color: '#6b6375',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    transition: 'all 0.2s ease',
  },
  errorBox: {
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: 500,
  },
  errorIcon: {
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 8,
    padding: '14px',
    background: '#8b1a2b',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footer: {
    margin: '20px 0 0',
    textAlign: 'center',
    color: '#6b6375',
    fontSize: 14,
  },
  link: {
    color: '#8b1a2b',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
};
