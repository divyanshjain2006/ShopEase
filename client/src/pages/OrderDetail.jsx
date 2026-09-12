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
      <Link to="/orders" style={styles.backLink}>
        ← Back to orders
      </Link>

      <div style={styles.header}>
        <h1 style={styles.title}>Order #{order._id.slice(-8)}</h1>
        <span
          style={{
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
          }}
        >
          {order.status}
        </span>
      </div>

      <div style={styles.grid}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Items</h2>
          <div style={styles.itemsList}>
            {order.items.map((item) => (
              <div key={item._id || item.product?.toString()} style={styles.itemRow}>
                <div style={styles.itemInfo}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemMeta}>Qty: {item.quantity}</p>
                </div>
                <span style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <aside style={styles.sidebar}>
          <div style={styles.orderInfo}>
            <h2 style={styles.sectionTitle}>Order info</h2>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Placed on</span>
              <span style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Total</span>
              <span style={{ ...styles.infoValue, fontWeight: 700, color: '#aa3bff', fontSize: 18 }}>
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {isOwner && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <div style={styles.cancelSection}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelBtn}
              >
                Cancel order
              </button>
              <p style={styles.cancelNote}>
                You can cancel this order if it hasn't been shipped yet.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 20px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e4e7',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 20,
    alignItems: 'start',
  },
  section: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    margin: 0,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e4e7',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f4f3ec',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    margin: 0,
    fontWeight: 600,
    color: 'var(--text-h, #08060d)',
    fontSize: 15,
  },
  itemMeta: {
    margin: '2px 0 0',
    color: '#6b6375',
    fontSize: 13,
  },
  itemPrice: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    fontSize: 15,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  orderInfo: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  infoLabel: {
    color: '#6b6375',
    fontSize: 14,
  },
  infoValue: {
    color: 'var(--text-h, #08060d)',
    fontSize: 14,
  },
  cancelSection: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  cancelBtn: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    border: '1px solid #b91c1c',
    color: '#b91c1c',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
    marginBottom: 10,
  },
  cancelNote: {
    margin: 0,
    color: '#6b6375',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
