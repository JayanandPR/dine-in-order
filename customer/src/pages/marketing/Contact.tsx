import { useState, FormEvent } from 'react';
import MarketingNav from '../../components/marketing/MarketingNav';
import Footer from '../../components/marketing/Footer';

const CONTACT_INFO = [
  { icon: '📧', label: 'Email', value: 'hello@dineinorder.com', href: 'mailto:hello@dineinorder.com' },
  { icon: '📞', label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999' },
  { icon: '📍', label: 'Location', value: 'Thiruvananthapuram, Kerala, India', href: '#' },
  { icon: '🕐', label: 'Support Hours', value: 'Mon–Fri, 9AM–6PM IST', href: '#' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #EFEFEF',
  borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box', outline: 'none', color: '#1A1A1A', background: '#FAFAF8',
  transition: 'border-color 0.15s',
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In production, connect to an email service or backend endpoint
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1A1A1A' }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #FDF0EE, #fff)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Get In Touch</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
          We'd love to hear from you
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Have a question about our platform? Want to onboard your restaurant? We're here to help.
        </p>
      </section>

      {/* Contact section */}
      <section style={{ padding: '3rem 1.5rem 5rem', background: '#FAFAF8' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

          {/* Contact info */}
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Contact information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {CONTACT_INFO.map(c => (
                <a key={c.label} href={c.href}
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', textDecoration: 'none' }}>
                  <div style={{ width: '44px', height: '44px', background: '#FDF0EE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{c.label}</div>
                    <div style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: 500 }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* For restaurants CTA */}
            <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🏪</div>
              <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Own a restaurant?</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Register your restaurant on Dine-In-Order and start accepting digital orders today.
              </p>
              <a href="https://dine-in-order-admin.vercel.app/register"
                style={{ display: 'inline-block', background: '#C8473A', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                Register Now →
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', border: '1px solid #EFEFEF' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Message sent!</h3>
                <p style={{ color: '#6B6B6B', lineHeight: 1.7 }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  style={{ marginTop: '1.5rem', background: 'none', border: '1px solid #EFEFEF', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer', color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Send us a message</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.4rem' }}>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={inputStyle} required
                      onFocus={e => (e.target.style.borderColor = '#C8473A')}
                      onBlur={e => (e.target.style.borderColor = '#EFEFEF')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.4rem' }}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle} required
                      onFocus={e => (e.target.style.borderColor = '#C8473A')}
                      onBlur={e => (e.target.style.borderColor = '#EFEFEF')} />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.4rem' }}>Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} style={inputStyle} required
                    onFocus={e => (e.target.style.borderColor = '#C8473A')}
                    onBlur={e => (e.target.style.borderColor = '#EFEFEF')}>
                    <option value="">Select a topic...</option>
                    <option>Register my restaurant</option>
                    <option>Technical support</option>
                    <option>Billing question</option>
                    <option>Partnership inquiry</option>
                    <option>General question</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.4rem' }}>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us more..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} required
                    onFocus={e => (e.target.style.borderColor = '#C8473A')}
                    onBlur={e => (e.target.style.borderColor = '#EFEFEF')} />
                </div>
                <button type="submit"
                  style={{ width: '100%', padding: '0.875rem', background: '#C8473A', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(200,71,58,0.3)' }}>
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;