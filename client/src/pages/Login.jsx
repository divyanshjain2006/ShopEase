import { useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setError, clearError } from '../redux/authSlice';
import { saveAuth } from '../services/api';
import api from '../services/api';
import Loader from '../components/Loader';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { token, loading } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect back after login
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
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Log in to your ShopEase account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
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
              placeholder="Enter your password"
              required
            />
          </label>

          {(formError || (useSelector && useSelector((s) => s.auth).error)) && (
            <p style={styles.errorText}>
              {formError || useSelector((s) => s.auth).error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <Loader size={20} /> : 'Log in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
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
