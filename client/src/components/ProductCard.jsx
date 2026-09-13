import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [hover, setHover] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const stockLabel = product.stock > 0 ? (product.stock < 5 ? 'Low stock' : 'In stock') : 'Out of stock';
  const isOutOfStock = product.stock === 0;

  return (
    <article
      style={{
        ...styles.card,
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 12px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        borderColor: hover ? '#d1d0d9' : '#e5e4e7',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link to={`/products/${product._id}`} style={styles.imageLink}>
        <div style={styles.imageWrap}>
          <img
            src={product.image || 'https://placehold.co/300x300/e5e4e7/6b6375?text=No+Image'}
            alt={product.name}
            style={{
              ...styles.image,
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/300x300/e5e4e7/6b6375?text=No+Image';
            }}
          />
          {isOutOfStock && (
            <div style={styles.outOfStockOverlay}>
              <span style={styles.outOfStockText}>Out of stock</span>
            </div>
          )}
        </div>
      </Link>
      <div style={styles.body}>
        <div style={styles.meta}>
          <span style={styles.category}>{product.category}</span>
          <span style={{ ...styles.stock, color: isOutOfStock ? '#b91c1c' : '#6b6375' }}>
            {stockLabel}
          </span>
        </div>
        <Link to={`/products/${product._id}`} style={styles.titleLink}>
          <h3 style={styles.title}>{product.name}</h3>
        </Link>
        <p style={styles.price}>₹{product.price.toFixed(2)}</p>
        <p style={styles.desc}>{product.description}</p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || added}
          style={{
            ...styles.addBtn,
            opacity: isOutOfStock ? 0.5 : added ? 1 : 1,
            background: added ? '#059669' : isOutOfStock ? '#e5e4e7' : '#8b1a2b',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          }}
        >
          {added ? '✓ Added' : isOutOfStock ? 'Unavailable' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

const styles = {
  card: {
    border: '1px solid #e5e4e7',
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  imageLink: {
    textDecoration: 'none',
    display: 'block',
  },
  imageWrap: {
    background: '#f4f3ec',
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  outOfStockOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.85)',
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
  body: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 11,
    color: '#6b6375',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 600,
    background: '#f4f3ec',
    padding: '2px 8px',
    borderRadius: 4,
  },
  stock: {
    fontSize: 12,
    fontWeight: 500,
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
    lineHeight: 1.3,
  },
  price: {
    fontWeight: 700,
    fontSize: 20,
    color: '#8b1a2b',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  desc: {
    margin: 0,
    fontSize: 13,
    color: '#6b6375',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  addBtn: {
    marginTop: 8,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'center',
  },
};
