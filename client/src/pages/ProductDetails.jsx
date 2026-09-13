import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import api from '../services/api';
import Loader from '../components/Loader';


export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load product details');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  if (loading) return <div style={styles.center}><Loader /></div>;

  if (error || !product) {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{error || 'Product not found'}</p>
        <Link to="/products" style={styles.linkBtn}>Back to products</Link>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <Link to="/products" style={styles.backLink}>
        ← Back to products
      </Link>

      <div style={styles.grid}>
        <div style={styles.imageWrap}>
          <img
            src={product.image || 'https://placehold.co/400x400/e5e4e7/6b6375?text=No+Image'}
            alt="" /* Empty alt because the h1 title describes the product perfectly */
            width="400"
            height="400"
            fetchpriority="high"
            decoding="async"
            style={styles.image}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x400/e5e4e7/6b6375?text=No+Image';
            }}
          />
          {product.stock === 0 && (
            <div style={styles.outOfStockOverlay}>
              <span style={styles.outOfStockText}>Out of stock</span>
            </div>
          )}
        </div>

        <div style={styles.details}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>₹{product.price.toFixed(2)}</p>

          <div style={styles.stockRow}>
            <span style={styles.stockBadge}>
              {product.stock === 0 ? (
                <span style={styles.stockBadgeText}>Out of stock</span>
              ) : (
                <span style={styles.stockBadgeText}>
                  {product.stock < 5 ? `${product.stock} left` : `${product.stock} available`}
                </span>
              )}
            </span>
          </div>

          <p style={styles.desc}>{product.description}</p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0 || added}
              style={{
                ...styles.addBtn,
                background: added ? '#059669' : product.stock === 0 ? '#e5e4e7' : '#8b1a2b',
                color: added ? '#fff' : product.stock === 0 ? '#4a3f41' : '#fff',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {added ? '✓ Added to cart' : product.stock === 0 ? 'Unavailable' : 'Add to cart'}
            </button>

            <Link to="/products" style={styles.secondaryLink}>
              ← Back to products
            </Link>

            <a
              href={`https://wa.me/919999999999?text=Hi!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappLink}
            >
              💬 Inquire on WhatsApp
            </a>
          </div>
        </div>
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
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    color: '#8b1a2b',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 28,
    alignItems: 'start',
  },
  imageWrap: {
    position: 'relative',
    border: '1px solid #e5e4e7',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#f4f3ec',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  image: {
    width: '100%',
    display: 'block',
    minHeight: 300,
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  outOfStockOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontWeight: 700,
    color: '#b91c1c',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  category: {
    display: 'inline-block',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#4a3f41',
    fontWeight: 600,
    background: '#f4f3ec',
    padding: '4px 10px',
    borderRadius: 4,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    lineHeight: 1.2,
  },
  price: {
    fontSize: 32,
    fontWeight: 700,
    color: '#8b1a2b',
    margin: 0,
    letterSpacing: '-1px',
  },
  stockRow: {
    display: 'flex',
    alignItems: 'center',
  },
  stockBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    background: 'var(--success-bg, #d1fae5)',
  },
  stockBadgeText: {
    color: 'var(--success-text, #065f46)',
    fontWeight: 600,
    fontSize: 13,
  },
  desc: {
    margin: 0,
    color: '#4a3f41',
    lineHeight: 1.7,
    fontSize: 15,
  },
  actions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  addBtn: {
    padding: '14px 24px',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.2s ease',
  },
  secondaryLink: {
    color: '#4a3f41',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
    padding: '10px 16px',
    border: '1px solid #e8d5c4',
    borderRadius: 8,
    transition: 'all 0.2s ease',
  },
  whatsappLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 20px',
    background: '#25D366',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(37,211,102,0.25)',
  },
  linkBtn: {
    marginTop: 8,
    display: 'inline-block',
    padding: '10px 18px',
    background: '#8b1a2b',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontWeight: 600,
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
};
