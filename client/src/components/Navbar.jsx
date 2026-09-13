import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount } from '../redux/cartSlice';
import { logout, clearError } from '../redux/authSlice';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleEscape(event) {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="Ethnic Threads home">
          <span className="logo-icon">🪡</span>
          <span className="logo-text">Ethnic Threads</span>
        </Link>

        <div className="navbar-search navbar-search-desktop">
          <input
            type="search"
            className="navbar-search-input"
            placeholder="Search blouses, fabrics…"
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
            className="navbar-search-btn"
            onClick={() => {
              const input = document.querySelector('.navbar-search-input');
              const value = input?.value.trim();
              if (value) {
                navigate(`/products?search=${encodeURIComponent(value)}`);
              }
            }}
          >
            Search
          </button>
        </div>

        <button
          type="button"
          className="navbar-hamburger"
          ref={hamburgerRef}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="navbar-mobile-menu"
        >
          <span className={`navbar-hamburger-bar ${mobileMenuOpen ? 'is-active' : ''}`} />
          <span className={`navbar-hamburger-bar ${mobileMenuOpen ? 'is-active' : ''}`} />
          <span className={`navbar-hamburger-bar ${mobileMenuOpen ? 'is-active' : ''}`} />
        </button>

        <div className="navbar-links">
          <nav aria-label="Primary" className="navbar-links-list">
            <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/products" className="navbar-link" onClick={closeMobileMenu}>
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="navbar-link" onClick={closeMobileMenu}>
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                    Admin
                  </Link>
                )}
                <Link to="/cart" className="navbar-link navbar-cart" onClick={closeMobileMenu}>
                  Cart
                  {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
                </Link>
                <div className="navbar-user" ref={userMenuRef}>
                  <button
                    type="button"
                    className="navbar-user-trigger"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label={`Account menu for ${user?.name || 'user'}`}
                  >
                    <span className="navbar-user-avatar" aria-hidden="true" />
                    <span className="navbar-user-name">{user?.name}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="navbar-user-menu" role="menu" aria-label="Account menu">
                      <div className="navbar-user-menu-header">
                        <span className="navbar-user-menu-name">{user?.name}</span>
                        <span className="navbar-user-menu-email">{user?.email}</span>
                      </div>
                      <button
                        type="button"
                        className="navbar-user-menu-item navbar-user-menu-logout"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="navbar-link navbar-cta" onClick={closeMobileMenu}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="navbar-mobile-menu" className="navbar-mobile-panel" aria-label="Mobile navigation">
          <div className="navbar-mobile-search">
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Search products…"
              autoFocus={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = e.target.value.trim();
                  if (value) {
                    navigate(`/products?search=${encodeURIComponent(value)}`);
                    setMobileMenuOpen(false);
                  }
                }
              }}
            />
            <button
              type="button"
              className="navbar-search-btn"
              onClick={() => {
                const input = document.querySelector('#navbar-mobile-menu .navbar-search-input');
                const value = input?.value.trim();
                if (value) {
                  navigate(`/products?search=${encodeURIComponent(value)}`);
                  setMobileMenuOpen(false);
                }
              }}
            >
              Search
            </button>
          </div>

          <nav aria-label="Mobile primary" className="navbar-mobile-links">
            <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/products" className="navbar-link" onClick={closeMobileMenu}>
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="navbar-link" onClick={closeMobileMenu}>
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                    Admin
                  </Link>
                )}
                <Link to="/cart" className="navbar-link navbar-cart" onClick={closeMobileMenu}>
                  Cart
                  {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
                </Link>
                <div className="navbar-mobile-user" ref={userMenuRef}>
                  <button
                    type="button"
                    className="navbar-user-trigger"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label={`Account menu for ${user?.name || 'user'}`}
                  >
                    <span className="navbar-user-avatar" aria-hidden="true" />
                    <span className="navbar-user-name">{user?.name}</span>
                    <svg className="navbar-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="navbar-user-menu navbar-user-menu-mobile" role="menu" aria-label="Account menu">
                      <div className="navbar-user-menu-header">
                        <span className="navbar-user-menu-name">{user?.name}</span>
                        <span className="navbar-user-menu-email">{user?.email}</span>
                      </div>
                      <button
                        type="button"
                        className="navbar-user-menu-item navbar-user-menu-logout"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="navbar-link navbar-cta" onClick={closeMobileMenu}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
