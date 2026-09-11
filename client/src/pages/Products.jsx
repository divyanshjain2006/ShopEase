import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCartItems } from '../redux/cartSlice';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';

  const fetchProducts = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotal(res.data.count || 0);
      if (!categories.length) setCategories(res.data.categories || []);
    } catch (err) {
      setError('Could not load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;
    if (sort) params.sort = sort;
    fetchProducts(params);
  }, [search, category, sort]);

  const updateUrl = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    navigate(`/products?${next.toString()}`);
  };

  const navigate = window.location?.assign || ((url) => (window.location.href = url));

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        {total > 0 && <p style={styles.subtitle}>{total} product{total !== 1 ? 's' : ''}</p>}
      </div>

      <div style={styles.controls}>
        <div style={styles.searchCtrl}>
          <input
            type="text"
            placeholder="Search products"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.target.value.trim();
                navigate(`/products?search=${encodeURIComponent(val)}&category=${category}&sort=${sort}`);
              }
            }}
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => {
              const val = document.querySelector('#prodSearch')?.value.trim() || '';
              navigate(`/products?search=${encodeURIComponent(val)}&category=${category}&sort=${sort}`);
            }}
            style={styles.btn}
          >
            Search
          </button>
        </div>

        <div style={styles.filters}>
          <label style={styles.filterLabel}>
            Category
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                navigate(`/products${val === 'all' ? '' : `?search=${search}&category=${val}&sort=${sort}`}`);
              }}
              style={styles.select}
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            Sort
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value;
                navigate(`/products?search=${search}&category=${category}&sort=${val}`);
              }}
              style={styles.select}
            >
              <option value="newest">Newest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>
          <Loader />
        </div>
      ) : !products.length ? (
        <div style={styles.empty}>
          <p>No products found.</p>
          <button type="button" onClick={() => navigate('/products')} style={styles.clearBtn}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 1200,
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
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e4e7',
  },
  searchCtrl: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    fontSize: 14,
  },
  btn: {
    padding: '10px 16px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  filters: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#6b6375',
    fontWeight: 500,
  },
  select: {
    padding: '8px 10px',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    background: '#fff',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  loading: {
    padding: 60,
    display: 'flex',
    justifyContent: 'center',
  },
  errorBox: {
    padding: 16,
    border: '1px solid #f5c6c6',
    borderRadius: 8,
    background: '#fef2f2',
    color: '#b91c1c',
    marginBottom: 16,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  retryBtn: {
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    border: '1px dashed #e5e4e7',
    borderRadius: 8,
  },
  clearBtn: {
    marginTop: 10,
    background: '#fff',
    border: '1px solid #aa3bff',
    color: '#aa3bff',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
};
