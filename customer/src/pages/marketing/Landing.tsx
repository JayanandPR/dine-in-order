import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingNav from '../../components/marketing/MarketingNav';
import Footer from '../../components/marketing/Footer';
import api from '../../api';

interface Restaurant {
  _id: string; name: string; cuisineType: string;
  averageRating: number; logo?: string; deliveryEnabled: boolean;
}

const HERO_BG = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80';

const FEATURES = [
  { icon: '📱', title: 'Scan & Order', desc: 'Customers scan a QR code at their table and browse the digital menu instantly — no app download needed.' },
  { icon: '🛵', title: 'Home Delivery', desc: 'Offer delivery alongside dine-in. Customers enter their address and track their order in real-time.' },
  { icon: '⚡', title: 'Real-Time Updates', desc: 'Orders appear instantly on staff screens via WebSocket. No more running between kitchen and tables.' },
  { icon: '💳', title: 'Seamless Payments', desc: 'Integrated Razorpay payments let customers pay digitally — no waiting for the bill.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track revenue, popular items, order trends, and ratings all from one clean admin dashboard.' },
  { icon: '👥', title: 'Staff Management', desc: 'Create staff accounts, manage roles, and give your team a dedicated app to process orders.' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🪑', title: 'Customer Sits Down', desc: 'Customer scans the QR code on their table with any phone camera. No app needed.' },
  { step: '02', icon: '🍽️', title: 'Browse & Order', desc: 'They browse your digital menu, add items to cart, and place an order in seconds.' },
  { step: '03', icon: '👨‍🍳', title: 'Kitchen Gets Notified', desc: 'Your staff app receives the order instantly. They update the status as they prepare it.' },
  { step: '04', icon: '💳', title: 'Pay & Leave', desc: 'Staff generates the bill, customer pays via Razorpay, and the table is freed automatically.' },
];

const STATS = [
  { value: '2 min', label: 'Average order time' },
  { value: '0', label: 'App downloads needed' },
  { value: '100%', label: 'Digital payments' },
  { value: '24/7', label: 'Platform uptime' },
];

const Landing = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    api.get('/restaurants/all').then(r => setRestaurants(r.data.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1A1A1A' }}>
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src={HERO_BG} alt="restaurant"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(200,71,58,0.2)', border: '1px solid rgba(200,71,58,0.4)', borderRadius: '20px', padding: '0.3rem 0.875rem', marginBottom: '1.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C8473A', display: 'block' }} />
              <span style={{ color: '#FCA5A5', fontSize: '0.8rem', fontWeight: 500 }}>Digital Ordering Platform</span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Scan QR &<br />Order Instantly
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '520px' }}>
              Transform your restaurant with digital ordering. Customers scan, order, and pay from their phone. Your staff gets orders in real-time. No app download needed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/restaurants"
                style={{ background: '#C8473A', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(200,71,58,0.4)', transition: 'transform 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                Browse Restaurants →
              </Link>
              <a href="#how-it-works"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                How It Works
              </a>
            </div>
          </div>
        </div>

        {/* Floating card */}
        <div style={{ position: 'absolute', right: '5%', bottom: '10%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'none' }}>
          <div style={{ color: '#fff', fontWeight: 700 }}>🎉 Order Placed!</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Table 4 · Butter Chicken ×2</div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section style={{ background: '#C8473A', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.25rem', color: '#fff', fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: '#FAFAF8' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Features</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', margin: '0 0 1rem' }}>Everything your restaurant needs</h2>
            <p style={{ color: '#6B6B6B', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              A complete digital ordering solution built for modern restaurants of all sizes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(f => (
              <div key={f.title}
                style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #EFEFEF', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ color: '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Process</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', margin: '0 0 1rem' }}>How it works</h2>
            <p style={{ color: '#6B6B6B', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              From QR scan to payment in under 3 minutes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: 'absolute', top: '2.5rem', right: '-0.75rem', color: '#EFEFEF', fontSize: '1.5rem', display: 'none' }}>→</div>
                )}
                <div style={{ width: '64px', height: '64px', background: '#FDF0EE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1.25rem' }}>
                  {step.icon}
                </div>
                <div style={{ color: '#C8473A', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>STEP {step.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{step.title}</h3>
                <p style={{ color: '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESTAURANT PREVIEW ────────────────────────────── */}
      {restaurants.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', background: '#FAFAF8' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Live on Platform</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', margin: 0 }}>Featured Restaurants</h2>
              </div>
              <Link to="/restaurants"
                style={{ color: '#C8473A', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {restaurants.map(r => (
                <Link key={r._id} to={`/home?restaurant=${r._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EFEFEF', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: '160px', background: 'linear-gradient(135deg, #2d3748, #4a5568)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
                      {r.logo ? <img src={r.logo} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                      {r.deliveryEnabled && (
                        <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#6D28D9', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                          🛵 Delivery
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', margin: '0 0 0.4rem', color: '#1A1A1A', fontSize: '1.1rem' }}>{r.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6B6B6B', fontSize: '0.825rem', textTransform: 'capitalize' }}>{r.cuisineType}</span>
                        {r.averageRating > 0 && <span style={{ color: '#1A1A1A', fontSize: '0.825rem', fontWeight: 600 }}>⭐ {r.averageRating.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #1A1A1A 0%, #2d3748 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem' }}>
            Ready to digitise your restaurant?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join Dine-In-Order and give your customers a seamless digital ordering experience.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/pricing"
              style={{ background: '#C8473A', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(200,71,58,0.4)' }}>
              Get Started Free
            </Link>
            <Link to="/contact"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;