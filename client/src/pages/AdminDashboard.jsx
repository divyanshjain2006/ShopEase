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

    if (!payload.name || !payload.description || isNaN(payload.price) || !payload.category) {
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
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Admin dashboard</h1>
          <p style={styles.subtitle}>Manage products and orders</p>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠</span>
          <span style={styles.errorText}>{error}</span>
          <button type="button" onClick={fetchData} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      <div style={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          style={{
            ...styles.tab,
            background: activeTab === 'products' ? '#8b1a2b' : '#fff',
            color: activeTab === 'products' ? '#fff' : 'var(--text-h, #08060d)',
            border: activeTab === 'products' ? 'none' : '1px solid #e5e4e7',
          }}
        >
          <span style={styles.tabIcon}>📦</span>
          Products
          <span style={styles.tabCount}>{products.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            ...styles.tab,
            background: activeTab === 'orders' ? '#8b1a2b' : '#fff',
            color: activeTab === 'orders' ? '#fff' : 'var(--text-h, #08060d)',
            border: activeTab === 'orders' ? 'none' : '1px solid #e5e4e7',
          }}
        >
          <span style={styles.tabIcon}>🛒</span>
          Orders
          <span style={styles.tabCount}>{orders.length}</span>
        </button>
        <button type="button" onClick={() => setShowProductForm(true)} style={styles.addBtn}>
          <span style={styles.addBtnIcon}>+</span>
          Add product
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <Loader size={48} />
        </div>
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
                <div style={styles.stockBadge}>
                  {p.stock === 0 ? (
                    <span style={styles.stockBadgeText}>Out of stock</span>
                  ) : (
                    <span style={styles.stockBadgeText}>{p.stock} in stock</span>
                  )}
                </div>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardMeta}>
                  {p.category} · ${p.price.toFixed(2)}
                </p>
                <div style={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(p);
                      setShowProductForm(true);
                    }}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id, p.name)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!products.length && (
            <div style={styles.emptyBox}>
              <span style={styles.emptyIcon}>📦</span>
              <p style={styles.emptyText}>No products yet.</p>
              <p style={styles.emptySubtext}>Add your first product to get started.</p>
              <button type="button" onClick={() => setShowProductForm(true)} style={styles.emptyActionBtn}>
                Add product
              </button>
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
                  <p style={styles.orderDate}>
                    {new Date(o.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  style={{
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
                  }}
                >
                  {o.status}
                </span>
              </div>
              <div style={styles.orderItems}>
                {o.items.slice(0, 3).map((item) => (
                  <span key={item._id || item.product?.toString()} style={styles.itemChip}>
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {o.items.length > 3 && (
                  <span style={styles.moreChip}>+{o.items.length - 3} more</span>
                )}
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
              <span style={styles.emptyIcon}>🛒</span>
              <p style={styles.emptyText}>No orders yet.</p>
              <p style={styles.emptySubtext}>Orders will appear here when customers make purchases.</p>
            </div>
          )}
        </div>
      ) : null}

      {showProductForm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit product' : 'Add new product'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                style={styles.closeBtn}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.fieldLabel}>
                <span style={styles.fieldLabelText}>Product name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="Enter product name"
                />
              </label>
              <label style={styles.fieldLabel}>
                <span style={styles.fieldLabelText}>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...styles.input, minHeight: 80 }}
                  required
                  placeholder="Describe the product"
                />
              </label>
              <div style={styles.fieldRow}>
                <label style={styles.fieldLabel}>
                  <span style={styles.fieldLabelText}>Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={styles.input}
                    required
                    placeholder="0.00"
                  />
                </label>
                <label style={styles.fieldLabel}>
                  <span style={styles.fieldLabelText}>Category</span>
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
                  <span style={styles.fieldLabelText}>Stock</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={styles.input}
                    required
                    placeholder="0"
                  />
                </label>
                <label style={styles.fieldLabel}>
                  <span style={styles.fieldLabelText}>Image URL</span>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    style={{ ...styles.input, flex: 2 }}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Cancel
                </button>
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
    marginBottom: 24,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  subtitle: {
    margin: '4px 0 0',
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
  errorText: {
    color: '#b91c1c',
    fontSize: 15,
  },
  linkBtn: {
    marginTop: 8,
    background: '#8b1a2b',
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
  loading: {
    padding: 80,
    display: 'flex',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    padding: 4,
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    width: 'fit-content',
    background: '#fafafa',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 14px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabCount: {
    background: 'rgba(0,0,0,0.08)',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
  },
  addBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#8b1a2b',
    color: '#fff',
    padding: '9px 16px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
  addBtnIcon: {
    fontWeight: 700,
    fontSize: 18,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s ease',
  },
  imageWrap: {
    position: 'relative',
    height: 140,
    background: '#f4f3ec',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '4px 8px',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: 600,
  },
  stockBadgeText: {
    color: '#6b6375',
  },
  cardBody: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  cardMeta: {
    margin: 0,
    color: '#6b6375',
    fontSize: 13,
    fontWeight: 500,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
  editBtn: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'background 0.2s ease',
  },
  emptyBox: {
    padding: 60,
    border: '1px dashed #e5e4e7',
    borderRadius: 12,
    textAlign: 'center',
    background: '#fafafa',
    gridColumn: '1 / -1',
  },
  emptyIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b6375',
    fontSize: 16,
    margin: '0 0 6px',
  },
  emptySubtext: {
    color: '#6b6375',
    fontSize: 14,
    margin: '0 0 16px',
    fontStyle: 'italic',
  },
  emptyActionBtn: {
    background: '#8b1a2b',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'background 0.2s ease',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  orderCard: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    transition: 'box-shadow 0.2s ease',
  },
  orderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  orderId: {
    margin: 0,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  orderDate: {
    margin: '3px 0 0',
    color: '#6b6375',
    fontSize: 13,
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  orderItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
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
  orderBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #e5e4e7',
    gap: 12,
  },
  total: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    fontSize: 16,
  },
  statusSelect: {
    padding: '8px 10px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    background: '#fafafa',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: 130,
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    maxWidth: 560,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: 28,
    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e4e7',
  },
  modalTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    border: 'none',
    background: '#f4f3ec',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
    color: '#6b6375',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#6b6375',
  },
  fieldLabelText: {
    fontWeight: 600,
  },
  input: {
    padding: '11px 14px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    fontSize: 15,
    background: '#fafafa',
    transition: 'all 0.2s ease',
  },
  fieldRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
    paddingTop: 12,
    borderTop: '1px solid #e5e4e7',
  },
  cancelBtn: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    background: '#8b1a2b',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
};
