// import { Link } from 'react-router-dom';
import MarketingNav from '../../components/marketing/MarketingNav';
import Footer from '../../components/marketing/Footer';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for small restaurants getting started with digital ordering.',
    color: '#6B7280',
    features: [
      '1 restaurant',
      'Up to 5 tables',
      'Digital menu',
      'QR code ordering',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get Started Free',
    ctaLink: 'https://dine-in-order-admin.vercel.app/register',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    period: 'per month',
    desc: 'For growing restaurants that need more tables and delivery.',
    color: '#C8473A',
    features: [
      'Everything in Starter',
      'Up to 20 tables',
      'Home delivery',
      'Staff management',
      'Advanced analytics',
      'Payment integration',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: 'https://dine-in-order-admin.vercel.app/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    desc: 'For restaurant chains and large operations with custom needs.',
    color: '#1A1A1A',
    features: [
      'Everything in Growth',
      'Unlimited tables',
      'Multiple branches',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-site training',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false,
  },
];

const FAQ_PRICING = [
  { q: 'Is the free plan really free?', a: 'Yes, the Starter plan is completely free with no credit card required. You can use it as long as you want.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes, you can change your plan at any time. Upgrades are instant, downgrades take effect at the next billing cycle.' },
  { q: 'Do you charge per order or per transaction?', a: 'No, we charge a flat monthly fee. Razorpay payment processing fees apply separately (as charged by Razorpay).' },
  { q: 'What payment methods do customers use?', a: 'Customers can pay via UPI, credit/debit cards, net banking, and wallets — all through Razorpay.' },
];

const Pricing = () => (
  <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1A1A1A' }}>
    <MarketingNav />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(135deg, #FDF0EE, #fff)', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Pricing</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
        Simple, transparent pricing
      </h1>
      <p style={{ color: '#6B6B6B', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
        Start free. Upgrade when you grow. No hidden fees, no long-term contracts.
      </p>
    </section>

    {/* Plans */}
    <section style={{ padding: '3rem 1.5rem 5rem', background: '#FAFAF8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {PLANS.map(plan => (
          <div key={plan.name}
            style={{ background: plan.highlight ? '#1A1A1A' : '#fff', borderRadius: '20px', padding: '2rem', border: plan.highlight ? 'none' : '1px solid #EFEFEF', position: 'relative', boxShadow: plan.highlight ? '0 16px 48px rgba(0,0,0,0.2)' : 'none', transform: plan.highlight ? 'scale(1.03)' : 'scale(1)' }}>
            {plan.highlight && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C8473A', color: '#fff', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Most Popular
              </div>
            )}
            <div style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#6B7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{plan.name}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: plan.highlight ? '#fff' : '#1A1A1A', lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#9CA3AF', fontSize: '0.85rem', paddingBottom: '0.4rem' }}>/{plan.period}</span>
            </div>
            <p style={{ color: plan.highlight ? 'rgba(255,255,255,0.65)' : '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>{plan.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.875rem', color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#4a5568' }}>
                  <span style={{ color: plan.highlight ? '#4ADE80' : '#48bb78', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <a href={plan.ctaLink}
              style={{ display: 'block', textAlign: 'center', padding: '0.875rem', background: plan.highlight ? '#C8473A' : 'transparent', color: plan.highlight ? '#fff' : '#1A1A1A', border: plan.highlight ? 'none' : '2px solid #1A1A1A', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing FAQ */}
    <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0 0 0.75rem' }}>Pricing FAQ</h2>
          <p style={{ color: '#6B6B6B', margin: 0 }}>Common questions about our pricing.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQ_PRICING.map(item => (
            <div key={item.q} style={{ border: '1px solid #EFEFEF', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item.q}</h3>
              <p style={{ color: '#6B6B6B', margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Pricing;