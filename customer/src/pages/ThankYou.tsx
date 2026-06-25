import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

const ThankYou = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get('table');
  const restaurantId = params.get('restaurant');
  const [count, setCount] = useState(5);
  const [billId, setBillId] = useState<string | null>(null);

  useEffect(() => {
    if (tableId) {
      api.get(`/bills/table/${tableId}`)
        .then(r => setBillId(r.data.data?._id))
        .catch(() => {});
    }
  }, [tableId]);

  useEffect(() => {
    if (count === 0) { navigate(`/orders?table=${tableId}&restaurant=${restaurantId}`); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate, tableId, restaurantId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #FDF0EE 0%, #FFF7F6 100%)', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(200,71,58,0.08)' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(200,71,58,0.06)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--brand, #C8473A), #E86B60)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(200,71,58,0.3)' }}>
          🎉
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#1A1A1A', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#6B6B6B', marginBottom: '0.25rem', fontSize: '1rem' }}>Thank you for dining with us.</p>
        <p style={{ color: '#A0A0A0', fontSize: '0.875rem', marginBottom: '2rem' }}>We hope to see you again soon!</p>

        {/* Countdown */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '0.875rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', background: '#C8473A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{count}</div>
          <p style={{ color: '#6B6B6B', fontSize: '0.875rem', margin: 0 }}>Redirecting to your orders</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
          <button onClick={() => navigate(`/orders?table=${tableId}&restaurant=${restaurantId}`)}
            style={{ padding: '0.875rem 2rem', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>
            View Order Summary
          </button>
          {billId && (
            <a href={`/invoice/${billId}`}
              style={{ display: 'block', padding: '0.875rem 2rem', background: 'transparent', color: '#C8473A', border: '2px solid #C8473A', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
              🧾 Download Invoice
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;