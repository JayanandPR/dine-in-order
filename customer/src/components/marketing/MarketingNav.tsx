import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/#features',   label: 'Features'    },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/restaurants', label: 'Restaurants'  },
  { to: '/pricing',     label: 'Pricing'      },
  { to: '/about',       label: 'About'        },
  { to: '/contact',     label: 'Contact'      },
];

const MarketingNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <style>{`
        .mnav-link { color: #4a5568; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.15s; }
        .mnav-link:hover { color: #C8473A; }
        @media (max-width: 640px) { .mnav-desktop { display: none !important; } }
        @media (min-width: 641px) { .mnav-mobile { display: none !important; } }
      `}</style>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EFEFEF', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🍴</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1A1A1A' }}>Dine-In-Order</span>
          </Link>

          {/* Desktop nav */}
          <div className="mnav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.to} href={link.to} className="mnav-link"
                style={{ color: location.pathname === link.to ? '#C8473A' : '#4a5568' }}>
                {link.label}
              </a>
            ))}
            <Link to="/restaurants"
              style={{ background: '#C8473A', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              Order Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="mnav-mobile" onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#1A1A1A', padding: '0.5rem' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mnav-mobile" style={{ background: '#fff', borderTop: '1px solid #EFEFEF', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.to} href={link.to} className="mnav-link" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link to="/restaurants" onClick={() => setOpen(false)}
              style={{ background: '#C8473A', color: '#fff', padding: '0.7rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
              Order Now
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default MarketingNav;