import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ThankYou = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get('table');
  const restaurantId = params.get('restaurant');
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count === 0) {
      navigate(`/orders?table=${tableId}&restaurant=${restaurantId}`);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate, tableId, restaurantId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#f0fff4', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ color: '#276749', marginBottom: '0.5rem' }}>Payment Successful!</h1>
      <p style={{ color: '#4a5568', marginBottom: '0.25rem' }}>Thank you for dining with us.</p>
      <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '2rem' }}>We hope to see you again!</p>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem 2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <p style={{ color: '#718096', fontSize: '0.875rem', margin: 0 }}>
          Redirecting to your order summary in <strong style={{ color: '#276749' }}>{count}s</strong>
        </p>
      </div>
      <button onClick={() => navigate(`/orders?table=${tableId}&restaurant=${restaurantId}`)}
        style={{ padding: '0.75rem 2rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
        View Order Summary
      </button>
    </div>
  );
};

export default ThankYou;