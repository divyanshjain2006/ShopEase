import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCartItems } from '../redux/cartSlice';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';


export default function Home() {
  const dispatch = useDispatch();



  return (
    <>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>✨ Handcrafted with Love</span>
          <h1 style={styles.heroTitle}>
            Exquisite Custom Stitched<br />Ethnic Wear & Fabrics
          </h1>
          <p style={styles.heroDesc}>
            Designer blouses, premium fabrics, kids' ethnic wear & more — each piece crafted to perfection for your special occasions.
          </p>
          <div style={styles.heroCta}>
            <Link to="/products" style={styles.primaryBtn}>
              Explore Collection
            </Link>
            <Link to="/products?category=Custom+Blouses" style={styles.secondaryBtn}>
              Custom Blouses
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
        </div>
        <div style={styles.categories}>
          {[
            { name: 'Custom Blouses', icon: '👗', desc: 'Designer stitched blouses' },
            { name: 'Fabrics & Materials', icon: '🧵', desc: 'Premium quality fabrics' },
            { name: 'Kids Ethnic Wear', icon: '👶', desc: 'Adorable traditional outfits' },
            { name: 'Sarees & Lehengas', icon: '🪷', desc: 'Elegant occasion wear' },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              style={styles.catCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,26,43,0.12)';
                e.currentTarget.style.borderColor = '#8b1a2b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e8d5c4';
              }}
            >
              <span style={styles.catIcon}>{cat.icon}</span>
              <span style={styles.catName}>{cat.name}</span>
              <span style={styles.catDesc}>{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section style={{ ...styles.section, marginTop: 0 }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Collection</h2>
          <Link to="/products" style={styles.seeAll}>
            View all →
          </Link>
        </div>
        <FeaturedProducts />
      </section>

      {/* WhatsApp CTA */}
      <section style={styles.whatsappSection}>
        <div style={styles.whatsappContent}>
          <h2 style={styles.whatsappTitle}>Need Custom Stitching?</h2>
          <p style={styles.whatsappDesc}>
            Get in touch with us on WhatsApp for custom measurements, fabric selection, and personalized designs.
          </p>
          <a
            href="https://wa.me/919999999999?text=Hi!%20I'm%20interested%20in%20your%20ethnic%20wear%20collection"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.whatsappBtn}
          >
            💬 Chat on WhatsApp
          </a>
        </div>
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
        <span style={styles.emptyIcon}>🧵</span>
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
    background: 'linear-gradient(135deg, #3d0c14 0%, #6e1422 40%, #8b1a2b 70%, #a0283a 100%)',
    padding: '90px 20px 80px',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 30% 80%, rgba(200,149,46,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroContent: {
    maxWidth: 720,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(200, 149, 46, 0.2)',
    color: '#f5d89a',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 20,
    letterSpacing: '0.3px',
    border: '1px solid rgba(200, 149, 46, 0.3)',
  },
  heroTitle: {
    fontSize: 'clamp(30px, 5vw, 48px)',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 16px',
    letterSpacing: '-0.5px',
    lineHeight: 1.15,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  heroDesc: {
    fontSize: '17px',
    color: 'rgba(255,255,255,0.8)',
    margin: '0 0 28px',
    lineHeight: 1.6,
  },
  heroCta: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: '#c8952e',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 15,
    transition: 'all 0.2s ease',
    display: 'inline-block',
    boxShadow: '0 4px 12px rgba(200,149,46,0.3)',
  },
  secondaryBtn: {
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 15,
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  section: {
    maxWidth: 1200,
    margin: '48px auto',
    padding: '0 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: '1px solid #e8d5c4',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: '#2d1a1e',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  seeAll: {
    color: '#8b1a2b',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
  categories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  catCard: {
    border: '1px solid #e8d5c4',
    borderRadius: 14,
    padding: '24px 16px',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#2d1a1e',
    background: '#fff',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  catName: {
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  catDesc: {
    fontSize: 12,
    color: '#4a3f41',
    fontWeight: 400,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  whatsappSection: {
    background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    padding: '48px 20px',
    textAlign: 'center',
    marginTop: 0,
  },
  whatsappContent: {
    maxWidth: 600,
    margin: '0 auto',
  },
  whatsappTitle: {
    margin: '0 0 10px',
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  whatsappDesc: {
    margin: '0 0 24px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 1.6,
  },
  whatsappBtn: {
    display: 'inline-block',
    background: '#25D366',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 15,
    boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
    transition: 'all 0.2s ease',
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
    border: '1px dashed #e8d5c4',
    borderRadius: 12,
    background: '#faf0e6',
  },
  emptyIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 12,
  },
  emptyText: {
    color: '#4a3f41',
    fontSize: 16,
    margin: '0 0 16px',
  },
  emptyLink: {
    color: '#8b1a2b',
    textDecoration: 'none',
    fontWeight: 600,
    padding: '8px 16px',
    border: '1px solid #8b1a2b',
    borderRadius: 6,
    display: 'inline-block',
  },
};
