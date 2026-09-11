import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../redux/cartSlice';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products')
      .then(() => dispatch(setCartItems([])))
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>Shop smarter, live better.</h1>
          <p style={styles.heroDesc}>
            Electronics, clothing, accessories and more — curated for you.
          </p>
          <div style={styles.heroCta}>
            <Link to="/products" style={styles.primaryBtn}>Shop now</Link>
            <Link to="/products?category=Electronics" style={styles.secondaryBtn}>Electronics</Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Categories</h2>
        </div>
        <div style={styles.categories}>
          {['Electronics', 'Clothing', 'Footwear', 'Accessories'].map((cat) => (
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} style={styles.catCard}>
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured products</h2>
          <Link to="/products" style={styles.seeAll}>View all</Link>
        </div>
        <FeaturedProducts />
      </section>
    </>
  );
}

function FeaturedProducts() {
  const dispatch = useDispatch();
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
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  if (loading) return <div style={styles.loadingRow}><Loader /></div>;

  if (!products.length) {
    return <p style={styles.empty}>No products yet.</p>;
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
  },
  heroInner: {
    maxWidth: 720,
    margin: '0 auto',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  heroDesc: {
    fontSize: 18,
    color: '#6b6375',
    margin: '0 0 24px',
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
  },
  secondaryBtn: {
    border: '1px solid #e5e4e7',
    color: 'var(--text-h, #08060d)',
    padding: '12px 24px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
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
    marginBottom: 16,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text-h, #08060d)',
  },
  seeAll: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  categories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  },
  catCard: {
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    padding: '18px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'var(--text-h, #08060d)',
    fontWeight: 600,
    fontSize: 15,
    background: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  errorBox: {
    padding: 20,
    border: '1px solid #f5c6c6',
    borderRadius: 8,
    background: '#fef2f2',
    color: '#b91c1c',
    maxWidth: 400,
    margin: '20px auto',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  loadingRow: {
    padding: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  empty: {
    color: '#6b6375',
    textAlign: 'center',
    padding: 40,
  },
};
