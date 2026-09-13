import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Products() {
  const navigate = useNavigate();
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
  };  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        {total > 0 && (
          <p style={styles.subtitle}>
            {total} product{total !== 1 ? 's' : ''}
            {search ? ` for "${search}"` : ''}
            {category !== 'all' ? ` in ${category}` : ''}
          </p>
        )}
      </div>

      <div style={styles.controls}>
        <div style={styles.searchCtrl}>
          <input
            id="prodSearch"
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.target.value.trim();
                if (val) {
                  navigate(`/products?search=${encodeURIComponent(val)}`);
                }
              }
            }}
            style={styles.input}
          />
          {search && (
            <button
              type="button"
              onClick={() => navigate('/products')}
              style={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div style={styles.filters}>
          <label style={styles.filterLabel}>
            <span style={styles.filterText}>Category</span>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  navigate(`/products?search=${search}&sort=${sort}`);
                } else {
                  navigate(`/products?search=${search}&category=${val}&sort=${sort}`);
                }
              }}
              style={styles.select}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.filterLabel}>
            <span style={styles.filterText}>Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                const val = e.target.value;
                navigate(`/products?search=${search}&category=${category}&sort=${val}`);
              }}
              style={styles.select}
            >
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠</span>
          <span style={styles.errorText}>{error}</span>
          <button type="button" onClick={() => window.location.reload()} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>
          <Loader size={48} />
        </div>
      ) : !products.length ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>📭</span>
          <p style={styles.emptyText}>No products found</p>
          {search || category !== 'all' ? (
            <button
              type="button"
              onClick={() => navigate('/products')}
              style={styles.clearBtn}
            >
              Clear filters
            </button>
          ) : (
            <p style={styles.emptySubtext}>Try adding some products via the admin panel.</p>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )
    }
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
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--text-h, #08060d)',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b6375',
    fontSize: 14,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1px solid #e5e4e7',
  },
  searchCtrl: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    maxWidth: 500,
  },
  input: {
    flex: 1,
    padding: '11px 14px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    fontSize: 15,
    background: '#fafafa',
    transition: 'all 0.2s ease',
  },
  clearSearchBtn: {
    width: 32,
    height: 32,
    border: 'none',
    background: '#e5e4e7',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    color: '#6b6375',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  filters: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    color: '#6b6375',
    fontWeight: 500,
  },
  filterText: {
    fontWeight: 600,
  },
  select: {
    padding: '9px 12px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#fafafa',
    fontSize: 14,
    cursor: 'pointer',
    minWidth: 160,
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  loading: {
    padding: 80,
    display: 'flex',
    justifyContent: 'center',
  },
  errorBox: {
    padding: 16,
    border: '1px solid #f5c6c6',
    borderRadius: 10,
    background: '#fef2f2',
    marginBottom: 20,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: '#b91c1c',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
  },
  retryBtn: {
    background: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  empty: {
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
    margin: '0 0 8px',
  },
  emptySubtext: {
    color: '#6b6375',
    fontSize: 14,
    margin: 0,
    fontStyle: 'italic',
  },
  clearBtn: {
    marginTop: 12,
    background: '#fff',
    border: '1px solid #8b1a2b',
    color: '#8b1a2b',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
};
