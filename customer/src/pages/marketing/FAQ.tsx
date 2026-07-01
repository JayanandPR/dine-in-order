import { useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingNav from '../../components/marketing/MarketingNav';
import Footer from '../../components/marketing/Footer';

const CATEGORIES = [
  {
    label: 'For Customers',
    icon: '🧑‍💼',
    faqs: [
      { q: 'Do I need to download an app to order?', a: 'No. You just scan the QR code on your table with your phone camera and the menu opens in your browser instantly. No app, no login required.' },
      { q: 'How do I pay for my order?', a: 'After the staff generates your bill, a payment banner appears on your screen. You can pay via UPI, credit/debit card, net banking, or any wallet through Razorpay.' },
      { q: 'Can I order for home delivery?', a: 'Yes, if the restaurant has enabled delivery. On the restaurant home page, tap "Order for Delivery", enter your address, and order from the menu. You can track your order in real-time.' },
      { q: 'Can I see the status of my order?', a: 'Yes. After placing an order, a status banner appears on your screen showing whether your order is pending, being prepared, or ready to serve — updated in real-time.' },
      { q: 'Can I get an invoice for my order?', a: 'Yes. After payment, you can view and download a PDF invoice from the Order History page or the Thank You page.' },
    ],
  },
  {
    label: 'For Restaurants',
    icon: '🏪',
    faqs: [
      { q: 'How do I register my restaurant?', a: 'Go to the Admin Dashboard, create an account with the "admin" role, then set up your restaurant details, menu, and tables. The whole process takes under 10 minutes.' },
      { q: 'How do QR codes work?', a: 'You create tables in the admin dashboard and each table automatically gets a unique QR code. You can also generate a general restaurant QR for the entrance. Download and print them.' },
      { q: 'Can I manage multiple staff members?', a: 'Yes. In the admin dashboard, go to Staff and create accounts for each staff member. They get access to the Staff App where they can manage orders and tables.' },
      { q: 'How do I track orders in real-time?', a: 'Staff use the Staff App which shows incoming orders instantly via WebSocket. No refresh needed — orders appear the moment a customer places them.' },
      { q: 'Can I offer both dine-in and delivery?', a: 'Yes. In Restaurant settings, enable delivery and set your fee, minimum order, and estimated delivery time. Customers will see both options on your restaurant page.' },
    ],
  },
  {
    label: 'Payments & Billing',
    icon: '💳',
    faqs: [
      { q: 'Which payment methods are supported?', a: 'All major payment methods via Razorpay: UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and digital wallets.' },
      { q: 'Are payments secure?', a: 'Yes. All payments are processed by Razorpay, which is PCI DSS compliant. We never store card details on our servers.' },
      { q: 'When does the customer pay?', a: 'For dine-in, the customer pays after eating when staff generates the bill. For delivery, the customer pays before the order is sent out.' },
      { q: 'Who gets the payment — Dine-In-Order or the restaurant?', a: 'Payments go directly to the restaurant via their Razorpay account. Dine-In-Order does not hold or deduct from customer payments.' },
    ],
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #EFEFEF', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '1.125rem 1.5rem', background: open ? '#FDF0EE' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A', textAlign: 'left' }}>{q}</span>
        <span style={{ color: '#C8473A', fontSize: '1.25rem', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.125rem', background: '#FDF0EE' }}>
          <p style={{ color: '#6B6B6B', fontSize: '0.875rem', lineHeight: 1.8, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1A1A1A' }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #FDF0EE, #fff)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: '#C8473A', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>FAQ</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
          Frequently asked questions
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Everything you need to know about Dine-In-Order.
        </p>
      </section>

      {/* FAQ content */}
      <section style={{ padding: '3rem 1.5rem 5rem', background: '#FAFAF8' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat, i) => (
              <button key={cat.label} onClick={() => setActiveCategory(i)}
                style={{ padding: '0.5rem 1.25rem', border: `1.5px solid ${activeCategory === i ? '#C8473A' : '#EFEFEF'}`, borderRadius: '20px', background: activeCategory === i ? '#FDF0EE' : '#fff', color: activeCategory === i ? '#C8473A' : '#6B7280', fontWeight: activeCategory === i ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* FAQs */}
          <div>
            {CATEGORIES[activeCategory].faqs.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Still have questions */}
          <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginTop: '3rem' }}>
            <h3 style={{ color: '#fff', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              Still have questions?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Can't find the answer you're looking for? Reach out to our team.
            </p>
            <Link to="/contact"
              style={{ display: 'inline-block', background: '#C8473A', color: '#fff', padding: '0.75rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;