import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, sans-serif', paddingTop: '4rem' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', paddingBottom: '3rem', borderBottom: '1px solid #2d2d2d' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🍴</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700 }}>Dine-In-Order</span>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
            The modern digital ordering platform for restaurants. Scan, order, and pay — all from your phone.
          </p>
          {/* Social links */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { icon: '𝕏', href: '#', label: 'Twitter' },
              { icon: 'in', href: '#', label: 'LinkedIn' },
              { icon: 'f', href: '#', label: 'Facebook' },
              { icon: '▶', href: '#', label: 'YouTube' },
            ].map(s => (
              <a key={s.label} href={s.href}
                style={{ width: '36px', height: '36px', background: '#2d2d2d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#C8473A')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2d2d2d')}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Home', to: '/' },
              { label: 'Restaurants', to: '/restaurants' },
              { label: 'Pricing', to: '/pricing' },
              { label: 'About Us', to: '/about' },
              { label: 'FAQ', to: '/faq' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* For Restaurants */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>For Restaurants</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Register your restaurant',
              'Manage your menu',
              'Track orders live',
              'View analytics',
              'Manage staff',
            ].map(item => (
              <span key={item} style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{item}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '📧', text: 'hello@dineinorder.com' },
              { icon: '📞', text: '+91 99999 99999' },
              { icon: '📍', text: 'Thiruvananthapuram, Kerala, India' },
            ].map(c => (
              <div key={c.text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '0.1rem' }}>{c.icon}</span>
                <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ color: '#6B7280', fontSize: '0.825rem' }}>
          © {new Date().getFullYear()} Dine-In-Order. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
            <a key={t} href="#"
              style={{ color: '#6B7280', fontSize: '0.825rem', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
              {t}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;