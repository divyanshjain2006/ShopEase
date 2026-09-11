import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setError, clearError } from '../redux/authSlice';
import { saveAuth } from '../services/api';
import api from '../services/api';
import Loader from '../components/Loader';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { token, loading } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [formError, setFormError] = useState('');

  const redirect = new URLSearchParams(search).get('redirect') || '/';

  if (token) {
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    dispatch(clearError());

    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user } = res.data;
      dispatch(setAuth({ token: newToken, user }));
      saveAuth({ token: newToken, user });
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch(setError(msg));
      setFormError(msg);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Start shopping with ShopEase</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Your name"
              required
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Min 6 characters"
              required
            />
          </label>

          <label style={styles.label}>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={styles.input}
              placeholder="Repeat password"
              required
            />
          </label>

          {(formError || useSelector((s) => s.auth).error) && (
            <p style={styles.errorText}>{formError || useSelector((s) => s.auth).error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <Loader size={20} /> : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
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
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 28,
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    textAlign: 'center',
  },
  subtitle: {
    margin: '6px 0 20px',
    textAlign: 'center',
    color: '#6b6375',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: '#6b6375',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    margin: 0,
    background: '#fef2f2',
    padding: '6px 10px',
    borderRadius: 6,
  },
  submitBtn: {
    marginTop: 4,
    padding: '12px',
    background: '#aa3bff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  footer: {
    margin: '16px 0 0',
    textAlign: 'center',
    color: '#6b6375',
  },
  link: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
