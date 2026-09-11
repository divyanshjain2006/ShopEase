import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount } from '../redux/cartSlice';
import { logout, clearError } from '../redux/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          ShopEase
        </Link>

        <div style={styles.search}>
          <input
            type="text"
            id="search"
            placeholder="Search products…"
            style={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                  navigate(`/products?search=${encodeURIComponent(value)}`);
                }
              }
            }}
          />
          <button
            type="button"
            style={styles.searchBtn}
            onClick={() => {
              const input = document.getElementById('search');
              const value = input?.value.trim();
              if (value) {
                navigate(`/products?search=${encodeURIComponent(value)}`);
              }
            }}
          >
            Search
          </button>
        </div>

        <div style={styles.links}>
          <Link to="/products" style={styles.link}>
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" style={styles.link}>
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" style={styles.link}>
                  Admin
                </Link>
              )}
              <span style={styles.cartLink}>
                <Link to="/cart" style={styles.link}>
                  Cart
                  {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </Link>
              </span>
              <div style={styles.user}>
                <span style={styles.username}>{user?.name}</span>
                <button type="button" style={styles.btn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.linkBtn}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: '1px solid #e5e4e7',
    background: 'var(--bg, #fff)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  nav: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  logo: {
    fontWeight: 700,
    fontSize: 22,
    color: 'var(--text-h, #08060d)',
    textDecoration: 'none',
  },
  search: {
    display: 'flex',
    flex: 1,
    minWidth: 220,
    maxWidth: 420,
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    fontSize: 14,
  },
  searchBtn: {
    marginLeft: 8,
    padding: '8px 12px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  link: {
    textDecoration: 'none',
    color: 'var(--text-h, #08060d)',
    fontSize: 14,
    fontWeight: 500,
  },
  linkBtn: {
    textDecoration: 'none',
    background: '#aa3bff',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  cartLink: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    background: '#aa3bff',
    color: '#fff',
    borderRadius: '50%',
    minWidth: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
  },
  username: {
    fontSize: 14,
    marginRight: 8,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
};
