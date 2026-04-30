import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="top">
      <Header />
      <Outlet />
      <Footer />
      <a
        href="#top"
        className="back-to-top back-to-top-modern"
        style={{ display: showTop ? 'flex' : 'none' }}
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Back to top"
      >
        <span className="back-to-top-modern__icon" aria-hidden />
      </a>
    </div>
  );
}
