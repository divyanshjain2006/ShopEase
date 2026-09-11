import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '', image: '' });

  const fetchData = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ]);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data.orders || []);
    } catch (err) {
      setError('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (showProductForm && !editingProduct) {
      setForm({ name: '', description: '', price: '', category: '', stock: '', image: '' });
    } else if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.price),
        category: editingProduct.category,
        stock: String(editingProduct.stock),
        image: editingProduct.image || '',
      });
    }
  }, [showProductForm, editingProduct]);

  const resetForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category.trim(),
      stock: parseInt(form.stock, 10) || 0,
      image: form.image.trim(),
    };

    if (!payload.name || !payload.description || !payload.price || !payload.category) {
      alert('Please fill in name, description, price and category');
      return;
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete product');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (user?.role !== 'admin') {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>Admin access required.</p>
        <button type="button" onClick={() => navigate('/')} style={styles.linkBtn}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin dashboard</h1>
        <p style={styles.subtitle}>Manage products and orders</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button type="button" onClick={fetchData} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      <div style={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          style={{ ...styles.tab, background: activeTab === 'products' ? '#aa3bff' : '#fff', color: activeTab === 'products' ? '#fff' : 'var(--text-h, #08060d)' }}
        >
          Products ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{ ...styles.tab, background: activeTab === 'orders' ? '#aa3bff' : '#fff', color: activeTab === 'orders' ? '#fff' : 'var(--text-h, #08060d)' }}
        >
          Orders ({orders.length})
        </button>
        <button type="button" onClick={() => setShowProductForm(true)} style={styles.addBtn}>
          + Add product
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}><Loader /></div>
      ) : activeTab === 'products' ? (
        <div style={styles.grid}>
          {products.map((p) => (
            <div key={p._id} style={styles.card}>
              <div style={styles.imageWrap}>
                <img
                  src={p.image || 'https://placehold.co/120x120/e5e4e7/6b6375?text=No+Image'}
                  alt={p.name}
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/120x120/e5e4e7/6b6375?text=No+Image';
                  }}
                />
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardMeta}>{p.category} · ${p.price.toFixed(2)} · {p.stock} in stock</p>
                <div style={styles.cardActions}>
                  <button type="button" onClick={() => { setEditingProduct(p); setShowProductForm(true); }} style={styles.editBtn}>Edit</button>
                  <button type="button" onClick={() => handleDelete(p._id, p.name)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {!products.length && (
            <div style={styles.emptyBox}>
              <p>No products yet. Add one to get started.</p>
              <button type="button" onClick={() => fetchOrders()} style={styles.retryBtn}>Retry data</button>
            </div>
          )}
        </div>
      ) : activeTab === 'orders' ? (
        <div style={styles.orderList}>
          {orders.map((o) => (
            <div key={o._id} style={styles.orderCard}>
              <div style={styles.orderTop}>
                <div>
                  <p style={styles.orderId}>Order #{o._id.slice(-8)}</p>
                  <p style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background:
                    o.status === 'Delivered' ? '#d1fae5' :
                    o.status === 'Shipped' ? '#dbeafe' :
                    o.status === 'Cancelled' ? '#fee2e2' :
                    '#fef3c7',
                  color:
                    o.status === 'Delivered' ? '#065f46' :
                    o.status === 'Shipped' ? '#1e3a8a' :
                    o.status === 'Cancelled' ? '#991b1b' :
                    '#92400e',
                }}>
                  {o.status}
                </span>
              </div>
              <div style={styles.orderItems}>
                {o.items.slice(0, 3).map((item) => (
                  <span key={item._id || item.product?.toString()} style={styles.itemChip}>
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
              <div style={styles.orderBottom}>
                <span style={styles.total}>${o.totalAmount.toFixed(2)}</span>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                  style={styles.statusSelect}
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
          {!orders.length && (
            <div style={styles.emptyBox}>
              <p>No orders yet.</p>
            </div>
          )}
        </div>
      ) : null}

      {showProductForm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingProduct ? 'Edit product' : 'Add product'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.fieldLabel}>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </label>
              <label style={styles.fieldLabel}>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...styles.input, minHeight: 70 }}
                  required
                />
              </label>
              <div style={styles.fieldRow}>
                <label style={styles.fieldLabel}>
                  Price
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={styles.input}
                    required
                  />
                </label>
                <label style={styles.fieldLabel}>
                  Category
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={styles.input}
                    required
                    placeholder="Electronics"
                  />
                </label>
              </div>
              <div style={styles.fieldRow}>
                <label style={styles.fieldLabel}>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={styles.input}
                    required
                  />
                </label>
                <label style={styles.fieldLabel}>
                  Image URL
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    style={{ ...styles.input, flex: 2 }}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>
                  {editingProduct ? 'Update product' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

let activeTab = 'products';

const styles = {
  wrap: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '24px 20px',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#6b6375',
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
    background: '#aa3bff',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
  errorBox: {
    padding: 14,
    border: '1px solid #f5c6c6',
    borderRadius: 8,
    background: '#fef2f2',
    color: '#b91c1c',
    marginBottom: 16,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  retryBtn: {
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  loading: {
    padding: 60,
    display: 'flex',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    padding: '4px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    width: 'fit-content',
  },
  tab: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  addBtn: {
    marginLeft: 'auto',
    background: '#aa3bff',
    color: '#fff',
    padding: '8px 14px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
  },
  card: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    height: 120,
    background: '#f4f3ec',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBody: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-h, #08060d)',
  },
  cardMeta: {
    margin: 0,
    color: '#6b6375',
    fontSize: 13,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 6,
  },
  editBtn: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  emptyBox: {
    padding: 40,
    border: '1px dashed #e5e4e7',
    borderRadius: 8,
    textAlign: 'center',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  orderCard: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    padding: 12,
    background: '#fff',
  },
  orderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    margin: 0,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  orderDate: {
    margin: '2px 0 0',
    color: '#6b6375',
    fontSize: 13,
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  orderItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  itemChip: {
    background: '#f4f3ec',
    borderRadius: 16,
    padding: '2px 10px',
    fontSize: 12,
    color: '#6b6375',
  },
  orderBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTop: '1px solid #e5e4e7',
  },
  total: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  statusSelect: {
    padding: '6px 8px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    maxWidth: 560,
    width: '100%',
    padding: 20,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    marginBottom: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  fieldLabel: {
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
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
  },
  fieldRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelBtn: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  submitBtn: {
    background: '#aa3bff',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};
