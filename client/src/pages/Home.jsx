import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../redux/cartSlice';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';


export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get('/products')
      .then(() => dispatch(setCartItems([])))
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Shop smarter, live better.</h1>
          <p style={styles.heroDesc}>
            Electronics, clothing, accessories and more — curated for you.
          </p>
          <div style={styles.heroCta}>
            <Link to="/products" style={styles.primaryBtn}>
              Shop now
            </Link>
            <Link to="/products?category=Electronics" style={styles.secondaryBtn}>
              Electronics
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Categories</h2>
        </div>
        <div style={styles.categories}>
          {['Electronics', 'Clothing', 'Footwear', 'Accessories'].map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              style={styles.catCard}
            >
              <span style={styles.catIcon}>✦</span>
              <span style={styles.catName}>{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ ...styles.section, marginTop: 0 }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured products</h2>
          <Link to="/products" style={styles.seeAll}>
            View all
          </Link>
        </div>
        <FeaturedProducts />
      </section>
    </>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/products');
        setProducts(res.data.products || []);
      } catch (err) {
        setError('Could not load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => ctrl.abort();
  }, []);

  if (error) {
    return (
      <div style={styles.errorBox}>
        <p style={styles.errorText}>{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={styles.retryBtn}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingRow}>
        <Loader size={48} />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>📦</span>
        <p style={styles.emptyText}>No products yet.</p>
        <Link to="/admin" style={styles.emptyLink}>
          Add products
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {products.slice(0, 8).map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #f4f3ec 0%, #e5e4e7 100%)',
    borderBottom: '1px solid #e5e4e7',
    padding: '80px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: 720,
    margin: '0 auto',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  heroDesc: {
    fontSize: '18px',
    color: '#6b6375',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
  heroCta: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: '#aa3bff',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  secondaryBtn: {
    border: '1px solid #e5e4e7',
    color: 'var(--text-h, #08060d)',
    padding: '12px 24px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
    background: '#fff',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  section: {
    maxWidth: 1200,
    margin: '40px auto',
    padding: '0 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e4e7',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  seeAll: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
  categories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
  },
  catCard: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    padding: '20px 16px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'var(--text-h, #08060d)',
    background: '#fff',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  catIcon: {
    fontSize: 24,
    color: '#aa3bff',
  },
  catName: {
    fontWeight: 600,
    fontSize: 15,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  errorBox: {
    padding: 20,
    border: '1px solid #f5c6c6',
    borderRadius: 10,
    background: '#fef2f2',
    color: '#b91c1c',
    maxWidth: 400,
    margin: '20px auto',
    textAlign: 'center',
  },
  errorText: {
    margin: '0 0 12px',
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 8,
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  loadingRow: {
    padding: 60,
    display: 'flex',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 60,
    textAlign: 'center',
    border: '1px dashed #e5e4e7',
    borderRadius: 12,
    background: '#fafafa',
  },
  emptyIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b6375',
    fontSize: 16,
    margin: '0 0 16px',
  },
  emptyLink: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    padding: '8px 16px',
    border: '1px solid #aa3bff',
    borderRadius: 6,
    display: 'inline-block',
  },
};
