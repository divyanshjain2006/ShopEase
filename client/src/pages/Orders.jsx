import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { clearCart, selectCartTotal, selectCartItems, setCartItems } from '../redux/cartSlice';
import api from '../services/api';
import Loader from '../components/Loader';


export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const cartItems = useSelector(selectCartItems);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    if (success) {
      dispatch(clearCart());
      alert('Payment successful! Your order has been placed.');
      navigate('/orders', { replace: true, query: {} });
    }
    if (cancelled) {
      alert('Checkout was cancelled.');
      navigate('/cart', { replace: true, query: {} });
    }
  }, [success, cancelled, dispatch, navigate]);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders/mine');
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={styles.center}>
        <h1 style={styles.title}>Orders</h1>
        <p style={styles.centerText}>Please log in to view your orders.</p>
        <Link to="/login" style={styles.primaryBtn}>Log in</Link>
      </div>
    );
  }  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>My orders</h1>
        {orders.length > 0 && (
          <p style={styles.subtitle}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </p>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠</span>
          <span style={styles.errorText}>{error}</span>
          <button type="button" onClick={fetchOrders} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>
          <Loader size={48} />
        </div>
      ) : !orders.length ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>📦</span>
          <p style={styles.emptyText}>You haven't placed any orders yet.</p>
          <p style={styles.emptySubtext}>When you complete a purchase, it will appear here.</p>
          <Link to="/products" style={styles.primaryBtn}>Browse products</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order, index) => (
            <div
              key={order._id}
              style={{
                ...styles.card,
                animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
              }}
            >
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.orderId}>Order #{order._id.slice(-8)}</p>
                  <p style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  style={{
                    ...styles.status,
                    background:
                      order.status === 'Delivered' ? '#d1fae5' :
                      order.status === 'Shipped' ? '#dbeafe' :
                      order.status === 'Cancelled' ? '#fee2e2' :
                      '#fef3c7',
                    color:
                      order.status === 'Delivered' ? '#065f46' :
                      order.status === 'Shipped' ? '#1e3a8a' :
                      order.status === 'Cancelled' ? '#991b1b' :
                      '#92400e',
                  }}
                >
                  {order.status}
                </span>
              </div>

              <div style={styles.itemsPreview}>
                {order.items.slice(0, 3).map((item) => (
                  <span key={item._id || item.product?.toString()} style={styles.itemChip}>
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span style={styles.moreChip}>+{order.items.length - 3} more</span>
                )}
              </div>

              <div style={styles.cardBottom}>
                <span style={styles.total}>${order.totalAmount.toFixed(2)}</span>
                <Link to={`/orders/${order._id}`} style={styles.viewBtn}>
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 20px',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b6375',
    fontSize: 14,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: 12,
    textAlign: 'center',
  },
  centerText: {
    color: '#6b6375',
    margin: 0,
  },
  primaryBtn: {
    marginTop: 12,
    display: 'inline-block',
    background: '#aa3bff',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
  loading: {
    padding: 80,
    display: 'flex',
    justifyContent: 'center',
  },
  errorBox: {
    padding: 14,
    border: '1px solid #f5c6c6',
    borderRadius: 10,
    background: '#fef2f2',
    color: '#b91c1c',
    marginBottom: 20,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
  },
  retryBtn: {
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  empty: {
    padding: 60,
    border: '1px dashed #e5e4e7',
    borderRadius: 12,
    textAlign: 'center',
    background: '#fafafa',
  },
  emptyIcon: {
    fontSize: 56,
    display: 'block',
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b6375',
    fontSize: 16,
    margin: '0 0 6px',
  },
  emptySubtext: {
    color: '#6b6375',
    fontSize: 14,
    margin: '0 0 20px',
    fontStyle: 'italic',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    transition: 'box-shadow 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  orderId: {
    margin: 0,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    fontSize: 15,
  },
  orderDate: {
    margin: '3px 0 0',
    color: '#6b6375',
    fontSize: 13,
  },
  status: {
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  itemsPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  itemChip: {
    background: '#f4f3ec',
    borderRadius: 16,
    padding: '4px 10px',
    fontSize: 12,
    color: '#6b6375',
    fontWeight: 500,
  },
  moreChip: {
    background: '#e5e4e7',
    borderRadius: 16,
    padding: '4px 10px',
    fontSize: 12,
    color: '#6b6375',
    fontWeight: 600,
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #e5e4e7',
    marginTop: 4,
  },
  total: {
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--text-h, #08060d)',
  },
  viewBtn: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    padding: '8px 12px',
    border: '1px solid #aa3bff',
    borderRadius: 6,
    transition: 'all 0.2s ease',
  },
};
