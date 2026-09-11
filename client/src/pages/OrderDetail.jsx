import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Loader from '../components/Loader';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.post(`/orders/${id}/cancel`);
      setOrder(res.data.order);
      alert('Order cancelled.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) return <div style={styles.center}><Loader /></div>;

  if (error || !order) {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{error || 'Order not found'}</p>
        <Link to="/orders" style={styles.linkBtn}>Back to orders</Link>
      </div>
    );
  }

  const isOwner = order.user?._id?.toString() === user?.id;

  return (
    <div style={styles.wrap}>
      <Link to="/orders" style={styles.backLink}>← Back to orders</Link>

      <h1 style={styles.title}>Order #{order._id.slice(-8)}</h1>

      <div style={styles.grid}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Items</h2>
          {order.items.map((item) => (
            <div key={item._id || item.product?.toString()} style={styles.itemRow}>
              <div style={styles.itemInfo}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemMeta}>Qty: {item.quantity}</p>
              </div>
              <span style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Order info</h2>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Status</span>
            <span style={{
              ...styles.statusBadge,
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
            }}>
              {order.status}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Placed on</span>
            <span style={styles.infoValue}>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Total</span>
            <span style={{ ...styles.infoValue, fontWeight: 700, color: '#aa3bff' }}>
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
          {isOwner && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel order
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '24px 20px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: 12,
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    marginBottom: 16,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 260px',
    gap: 20,
    alignItems: 'start',
  },
  section: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    padding: 14,
    background: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    margin: 0,
    marginBottom: 10,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f4f3ec',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    margin: 0,
    fontWeight: 600,
    color: 'var(--text-h, #08060d)',
  },
  itemMeta: {
    margin: '2px 0 0',
    color: '#6b6375',
    fontSize: 13,
  },
  itemPrice: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
  },
  infoLabel: {
    color: '#6b6375',
    fontSize: 14,
  },
  infoValue: {
    color: 'var(--text-h, #08060d)',
    fontSize: 14,
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  cancelBtn: {
    marginTop: 12,
    padding: '8px 14px',
    background: '#fff',
    border: '1px solid #b91c1c',
    color: '#b91c1c',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
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
  errorText: {
    color: '#b91c1c',
    fontSize: 15,
  },
  linkBtn: {
    marginTop: 8,
    display: 'inline-block',
    padding: '10px 18px',
    background: '#aa3bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontWeight: 600,
  },
};
