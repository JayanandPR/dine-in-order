import MarketingNav from '../../components/marketing/MarketingNav';
import Footer from '../../components/marketing/Footer';

const TEAM = [
  { name: 'Jayanand', role: 'Founder & Developer', emoji: '👨‍💻', bio: 'Full-stack developer passionate about building products that solve real problems for restaurants.' },
];

const VALUES = [
  { icon: '🚀', title: 'Speed', desc: 'We believe ordering food should be faster than waiting for a waiter.' },
  { icon: '🎯', title: 'Simplicity', desc: 'No app downloads. No logins. Just scan and order.' },
  { icon: '🤝', title: 'Reliability', desc: 'Real-time updates and stable payments your restaurant can count on.' },
  { icon: '📈', title: 'Growth', desc: 'Built-in analytics help restaurants understand and grow their business.' },
];

const About = () => (
  <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1A1A1A' }}>
    <MarketingNav />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(135deg, #FDF0EE, #fff)', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Our Story</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.25rem' }}>
          Built for restaurants,<br />by someone who loves food
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>
          Dine-In-Order started as a solution to a simple frustration — waiting too long to order food at a restaurant. We built a platform that makes digital ordering effortless for both customers and restaurant owners.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section style={{ padding: '5rem 1.5rem', background: '#FAFAF8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Our Mission</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '1.25rem' }}>Modernise every restaurant</h2>
          <p style={{ color: '#6B6B6B', lineHeight: 1.8, marginBottom: '1rem' }}>
            We're on a mission to bring every restaurant — from small cafés to large dining chains — into the digital age without complexity or high costs.
          </p>
          <p style={{ color: '#6B6B6B', lineHeight: 1.8, margin: 0 }}>
            Our platform handles everything from menu management and order processing to payments and delivery — so restaurant owners can focus on what they do best: making great food.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { n: '100+', l: 'Orders processed' },
            { n: '5★', l: 'Average rating' },
            { n: '2', l: 'Restaurants onboarded' },
            { n: '0', l: 'App downloads needed' },
          ].map(s => (
            <div key={s.l} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #EFEFEF', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#C8473A', fontWeight: 700 }}>{s.n}</div>
              <div style={{ color: '#6B6B6B', fontSize: '0.825rem', marginTop: '0.25rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Values</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: 0 }}>What we stand for</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ padding: '1.5rem', border: '1px solid #EFEFEF', borderRadius: '16px', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8473A')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#EFEFEF')}>
              <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{v.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{v.title}</h3>
              <p style={{ color: '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section style={{ padding: '5rem 1.5rem', background: '#FAFAF8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Team</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: 0 }}>The people behind it</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {TEAM.map(t => (
            <div key={t.name} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', textAlign: 'center', border: '1px solid #EFEFEF', maxWidth: '280px' }}>
              <div style={{ width: '80px', height: '80px', background: '#FDF0EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1rem' }}>
                {t.emoji}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t.name}</h3>
              <div style={{ color: '#C8473A', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.75rem' }}>{t.role}</div>
              <p style={{ color: '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{t.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;