import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadAuth } from './services/api';
import { setAuth, clearError, setLoading } from './redux/authSlice';
import api from './services/api';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AuthCheck() {
  const dispatch = useDispatch();
  const { token, loading: authLoading, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(setLoading(true));
    const stored = loadAuth();
    if (stored && stored.token) {
      dispatch(setAuth({ token: stored.token, user: stored.user }));
    } else {
      dispatch(clearError());
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  if (authLoading) {
    return (
      <div style={styles.center}>
        <Loader />
        <p style={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  return null;
}

function AppRoutes() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
          <Route
            path="/orders"
            element={
              isAuthenticated ? (
                <Orders />
              ) : (
                <Navigate to="/login?redirect=/orders" replace />
              )
            }
          />
          <Route
            path="/orders/:id"
            element={
              isAuthenticated ? (
                <OrderDetail />
              ) : (
                <Navigate to="/login?redirect=/orders" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <AdminDashboard />
              ) : isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login?redirect=/admin" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthCheck />
      <AppRoutes />
    </BrowserRouter>
  );
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#4a3f41',
    margin: 0,
  },
};
