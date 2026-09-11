import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectCartItems, selectCartTotal, updateQuantity, removeFromCart, clearCart } from '../redux/cartSlice';
import api from '../services/api';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { isAuthenticated, token } = useSelector((s) => s.auth);
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

    try {
      const payload = {
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        totalAmount: total,
      };
      const res = await api.post('/stripe/create-checkout-session', payload);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert('Unable to start checkout. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    }
  };

  if (!items.length) {
    return (
      <div style={styles.center}>
        <h1 style={styles.title}>Your cart is empty</h1>
        <Link to="/products" style={styles.primaryBtn}>Browse products</Link>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Shopping cart</h1>

      <div style={styles.layout}>
        <section style={styles.itemsSection}>
          {items.map((item) => (
            <div key={item._id} style={styles.item}>
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

              <div style={styles.itemInfo}>
                <Link to={`/products/${item._id}`} style={styles.itemName}>
                  {item.name}
                </Link>
                <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>

                <div style={styles.controls}>
                  <div style={styles.quantity}>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={styles.qtyBtn}
                    >
                      -
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
                  <button type="button" onClick={() => handleRemove(item._id)} style={styles.removeBtn}>
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
            <span style={styles.summaryValue}>$0.00</span>
          </div>
          <div style={{ ...styles.summaryRow, borderTop: '1px solid #e5e4e7', paddingTop: 8 }}>
            <span style={{ ...styles.summaryLabel, fontWeight: 700 }}>Total</span>
            <span style={{ ...styles.summaryValue, fontWeight: 700, color: '#aa3bff' }}>${total.toFixed(2)}</span>
          </div>

          {!isAuthenticated ? (
            <div style={styles.authNotice}>
              <p>Please log in to checkout.</p>
              <Link to="/login" style={styles.primaryBtn}>Log in</Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              style={{
                ...styles.checkoutBtn,
                opacity: items.length === 0 ? 0.5 : 1,
              }}
              disabled={items.length === 0}
            >
              Checkout with Stripe (test)
            </button>
          )}

          <Link to="/products" style={styles.viewCartLink}>
            Continue shopping
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
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: 16,
    textAlign: 'center',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 24,
    marginTop: 20,
    alignItems: 'start',
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    padding: 12,
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#fff',
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    background: '#f4f3ec',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    textDecoration: 'none',
    color: 'var(--text-h, #08060d)',
    fontWeight: 600,
    fontSize: 15,
    display: 'block',
  },
  itemPrice: {
    margin: '2px 0 8px',
    color: '#6b6375',
    fontSize: 14,
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
    borderRadius: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    border: 'none',
    background: '#f4f3ec',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: 600,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  itemTotal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b6375',
  },
  totalValue: {
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    fontSize: 15,
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
  },
  summary: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    padding: 16,
    background: '#fff',
  },
  summaryTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    marginBottom: 12,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
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
    marginTop: 12,
    padding: 12,
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    textAlign: 'center',
  },
  primaryBtn: {
    display: 'inline-block',
    marginTop: 8,
    background: '#aa3bff',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 18px',
    borderRadius: 8,
    fontWeight: 600,
  },
  checkoutBtn: {
    width: '100%',
    marginTop: 12,
    padding: '12px',
    background: '#aa3bff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
  },
  viewCartLink: {
    display: 'block',
    marginTop: 12,
    textAlign: 'center',
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
};
