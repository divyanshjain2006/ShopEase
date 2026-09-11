import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const stockLabel = product.stock > 0 ? (product.stock < 5 ? 'Low stock' : 'In stock') : 'Out of stock';

  return (
    <article style={styles.card}>
      <div style={styles.imageWrap}>
        <img
          src={product.image || 'https://placehold.co/300x300/e5e4e7/6b6375?text=No+Image'}
          alt={product.name}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x300/e5e4e7/6b6375?text=No+Image';
          }}
        />
      </div>
      <div style={styles.body}>
        <div style={styles.meta}>
          <span style={styles.category}>{product.category}</span>
          <span style={{ ...styles.stock, color: product.stock === 0 ? '#b91c1c' : '#6b6375' }}>
            {stockLabel}
          </span>
        </div>
        <Link to={`/products/${product._id}`} style={styles.titleLink}>
          <h3 style={styles.title}>{product.name}</h3>
        </Link>
        <p style={styles.price}>${product.price.toFixed(2)}</p>
        <p style={styles.desc}>{product.description}</p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0 || added}
          style={{
            ...styles.addBtn,
            opacity: product.stock === 0 ? 0.5 : 1,
            background: added ? '#059669' : '#aa3bff',
          }}
        >
          {added ? 'Added to cart' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

import { Link } from 'react-router-dom';

const styles = {
  card: {
    border: '1px solid #e5e4e7',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    background: '#f4f3ec',
    height: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  body: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#6b6375',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  stock: {
    fontSize: 12,
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-h, #08060d)',
  },
  price: {
    fontWeight: 700,
    fontSize: 18,
    color: '#aa3bff',
    margin: 0,
  },
  desc: {
    margin: 0,
    fontSize: 13,
    color: '#6b6375',
    lineHeight: 1.4,
  },
  addBtn: {
    marginTop: 'auto',
    padding: '10px',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
};
