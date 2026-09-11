import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { useSelector } from 'react-redux';
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
            alt={product.name}
            style={styles.image}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x400/e5e4e7/6b6375?text=No+Image';
            }}
          />
        </div>

        <div style={styles.details}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>${product.price.toFixed(2)}</p>

          <p style={styles.desc}>{product.description}</p>

          <div style={styles.stockRow}>
            <span style={styles.stockLabel}>Stock:</span>
            <span style={{
              color: product.stock === 0 ? '#b91c1c' : '#059669',
              fontWeight: 600,
            }}>
              {product.stock === 0 ? 'Out of stock' : `${product.stock} available`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0 || added}
            style={{
              ...styles.addBtn,
              background: added ? '#059669' : '#aa3bff',
              opacity: product.stock === 0 ? 0.5 : 1,
            }}
          >
            {added ? 'Added to cart' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>

          <div style={styles.actions}>
            <Link to="/products" style={styles.link}>
              View all products
            </Link>
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
    display: 'inline-block',
    marginBottom: 16,
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    alignItems: 'start',
  },
  imageWrap: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#f4f3ec',
  },
  image: {
    width: '100%',
    display: 'block',
    minHeight: 260,
    objectFit: 'cover',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b6375',
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  price: {
    fontSize: 24,
    fontWeight: 700,
    color: '#aa3bff',
    margin: 0,
  },
  desc: {
    margin: 0,
    color: '#6b6375',
    lineHeight: 1.6,
    fontSize: 15,
  },
  stockRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  stockLabel: {
    color: '#6b6375',
  },
  addBtn: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
  },
  actions: {
    marginTop: 8,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  link: {
    color: '#6b6375',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
  },
  linkBtn: {
    marginTop: 12,
    display: 'inline-block',
    padding: '10px 18px',
    background: '#aa3bff',
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
