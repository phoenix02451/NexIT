import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { siteInfo } from '../config/siteInfo';

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 35);
      if (window.scrollY > 35) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navHref = (hash) => (pathname === '/' ? `#${hash}` : `/#${hash}`);

  return (
    <header
      className="header"
      style={
        scrolled
          ? { background: '#002e5f', boxShadow: '0 .2rem .5rem rgba(0,0,0,.4)' }
          : { background: 'none', boxShadow: 'none' }
      }
    >
      <Link to="/" className="logo" onClick={() => setMenuOpen(false)} title={siteInfo.companyName}>
        <img src={siteInfo.logoSrc} alt="" className="logo-img" width="40" height="40" decoding="async" />
        <span className="logo-wordmark">{siteInfo.shortName}</span>
      </Link>
      <div
        className={`fas fa-bars ${menuOpen ? 'fa-times' : ''}`}
        onClick={() => setMenuOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setMenuOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-label="Toggle menu"
      />
      <nav className={`navbar ${menuOpen ? 'nav-toggle' : ''}`}>
        <ul>
          <li>
            <a href={navHref('home')} onClick={() => setMenuOpen(false)}>
              home
            </a>
          </li>
          <li>
            <a href={navHref('about')} onClick={() => setMenuOpen(false)}>
              about
            </a>
          </li>
          <li>
            <a href={navHref('service')} onClick={() => setMenuOpen(false)}>
              services
            </a>
          </li>
          <li>
            <a href={navHref('introduce')} onClick={() => setMenuOpen(false)}>
              introduce
            </a>
          </li>
          <li>
            <a href={navHref('team')} onClick={() => setMenuOpen(false)}>
              team
            </a>
          </li>
          <li>
            <Link to="/careers" onClick={() => setMenuOpen(false)}>
              career
            </Link>
          </li>
          <li>
            <a href={navHref('footer-contact')} onClick={() => setMenuOpen(false)}>
              contact
            </a>
          </li>
          <li>
            <a href={navHref('faq')} onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/account" onClick={() => setMenuOpen(false)}>
                  account
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="header-auth-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  sign out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  sign in
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
