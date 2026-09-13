import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectCartItems, selectCartTotal, updateQuantity, removeFromCart, clearCart } from '../redux/cartSlice';
import api from '../services/api';


export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const total = useSelector(selectCartTotal);

  const handleUpdate = (id, quantity) => {
    dispatch(updateQuantity({ _id: id, quantity: quantity || 1 }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!items.length) return;

    alert('Checkout successful! (Simulated)');
    dispatch(clearCart());
    navigate('/');
  };

  if (!items.length) {
    return (
      <div style={styles.center}>
        <div style={styles.emptyIcon}>🛒</div>
        <h1 style={styles.title}>Your cart is empty</h1>
        <p style={styles.emptyText}>Looks like you haven't added anything yet.</p>
        <Link to="/products" style={styles.primaryBtn}>Browse products</Link>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Shopping cart</h1>
        <p style={styles.subtitle}>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div style={styles.layout}>
        <section style={styles.itemsSection}>
          {items.map((item) => (
            <div key={item._id} style={styles.item}>
              <Link to={`/products/${item._id}`} style={styles.imageLink}>
                <div style={styles.imageWrap}>
                  <img
                    src={item.image || 'https://placehold.co/120x120/e5e4e7/6b6375?text=Item'}
                    alt={item.name}
                    style={styles.image}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/120x120/e5e4e7/6b6375?text=Item';
                    }}
                  />
                </div>
              </Link>

              <div style={styles.itemInfo}>
                <Link to={`/products/${item._id}`} style={styles.itemName}>
                  {item.name}
                </Link>
                <p style={styles.itemPrice}>${item.price.toFixed(2)} each</p>

                <div style={styles.controls}>
                  <div style={styles.quantity}>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={styles.qtyBtn}
                    >
                      −
                    </button>
                    <span style={styles.qty}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item._id, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item._id)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={styles.itemTotal}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}

          <button type="button" onClick={handleClear} style={styles.clearBtn}>
            Clear cart
          </button>
        </section>

        <aside style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order summary</h2>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal</span>
            <span style={styles.summaryValue}>${total.toFixed(2)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Shipping</span>
            <span style={{ ...styles.summaryValue, color: '#059669' }}>Free</span>
          </div>
          <div style={{ ...styles.summaryRow, borderTop: '1px solid #e5e4e7', paddingTop: 10 }}>
            <span style={{ ...styles.summaryLabel, fontWeight: 700 }}>Total</span>
            <span style={{ ...styles.summaryValue, fontWeight: 700, color: '#8b1a2b', fontSize: 18 }}>
              ${total.toFixed(2)}
            </span>
          </div>

          {!isAuthenticated ? (
            <div style={styles.authNotice}>
              <p style={styles.authNoticeText}>Please log in to checkout.</p>
              <Link to="/login" style={styles.primaryBtn}>Log in</Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              style={styles.checkoutBtn}
              disabled={items.length === 0}
            >
              Checkout (Simulated)
            </button>
          )}

          <Link to="/products" style={styles.viewCartLink}>
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

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
    fontSize: 28,
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
    padding: '80px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b6375',
    fontSize: 16,
    margin: '0 0 20px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 24,
    alignItems: 'start',
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  item: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    padding: 14,
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    background: '#fff',
    transition: 'box-shadow 0.2s ease',
  },
  imageLink: {
    textDecoration: 'none',
    display: 'block',
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    background: '#f4f3ec',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    paddingTop: 4,
  },
  itemName: {
    textDecoration: 'none',
    color: 'var(--text-h, #08060d)',
    fontWeight: 600,
    fontSize: 15,
    display: 'block',
    transition: 'color 0.2s ease',
  },
  itemPrice: {
    margin: '2px 0 10px',
    color: '#6b6375',
    fontSize: 13,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  quantity: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    padding: '4px 4px',
    background: '#fafafa',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 15,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    padding: 6,
    borderRadius: 4,
    transition: 'background 0.15s ease',
  },
  itemTotal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#6b6375',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  totalValue: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    fontSize: 16,
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#6b6375',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline',
    padding: 0,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  summary: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: 20,
    background: '#fff',
    position: 'sticky',
    top: 80,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  summaryTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e4e7',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  summaryLabel: {
    color: '#6b6375',
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    color: 'var(--text-h, #08060d)',
  },
  authNotice: {
    marginTop: 16,
    padding: 14,
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    textAlign: 'center',
    background: '#fafafa',
  },
  authNoticeText: {
    color: '#6b6375',
    fontSize: 14,
    margin: '0 0 10px',
  },
  primaryBtn: {
    display: 'inline-block',
    background: '#8b1a2b',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    transition: 'background 0.2s ease',
  },
  checkoutBtn: {
    width: '100%',
    marginTop: 16,
    padding: '14px',
    background: '#8b1a2b',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.2s ease',
  },
  viewCartLink: {
    display: 'block',
    marginTop: 14,
    textAlign: 'center',
    color: '#8b1a2b',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
};
