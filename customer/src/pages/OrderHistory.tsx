import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useWebSocket } from '../hooks/useWebSocket';

interface OrderItem { name: string; quantity: number; price: number; }
interface Order { _id: string; status: string; totalAmount: number; orderedAt: string; items: OrderItem[]; }
interface Bill { _id: string; totalPayableAmount: number; isPaid: boolean; }

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#92400E', bg: '#FFF7ED', label: '⏳ Waiting' },
  preparing: { color: '#1E40AF', bg: '#EFF6FF', label: '👨‍🍳 Preparing' },
  ready:     { color: '#166534', bg: '#F0FDF4', label: '✅ Ready' },
  served:    { color: '#4B5563', bg: '#F9FAFB', label: '🍽️ Served' },
  cancelled: { color: '#991B1B', bg: '#FEF2F2', label: '❌ Cancelled' },
};

const OrderHistory = () => {
  const [params] = useSearchParams();
  const tableId = params.get('table');
  const restaurantId = params.get('restaurant');

  const [orders, setOrders] = useState<Order[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) return;
    Promise.all([
      api.get(`/orders/table/${tableId}`),
      api.get(`/bills/table/${tableId}`).catch(() => null),
    ]).then(([ordersRes, billRes]) => {
      setOrders(ordersRes.data.data);
      if (billRes) setBill(billRes.data.data);
    }).finally(() => setLoading(false));
  }, [tableId]);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'order:status_update')
      setOrders(prev => prev.map(o => o._id === msg.payload.orderId ? { ...o, status: msg.payload.status } : o));
    if (msg.event === 'bill:generated') setBill(msg.payload);
  }, []);

  useWebSocket(tableId || '', restaurantId || '', handleWsMessage);

  const submitRating = async () => {
    if (!bill || rating === 0) return;
    try {
      await api.post('/ratings', { billId: bill._id, rating, comment });
      setRated(true);
      setRatingMsg('🙏 Thanks for your feedback!');
    } catch (err: any) {
      setRatingMsg(err.response?.data?.message || 'Error submitting rating');
    }
  };

  if (!tableId) return <p style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>Invalid link.</p>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'Inter, sans-serif', background: 'var(--surface-2)', minHeight: '100vh', paddingBottom: '2rem' }}>
      <Navbar restaurantName="My Orders" />

      <div style={{ padding: '1rem' }}>
        {/* Back to menu */}
        <a href={`/menu?table=${tableId}&restaurant=${restaurantId}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          ← Back to Menu
        </a>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-2)' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
            <p>No orders placed yet.</p>
          </div>
        ) : (
          orders.map(o => {
            const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.served;
            return (
              <div key={o._id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{new Date(o.orderedAt).toLocaleTimeString()}</span>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {cfg.label}
                  </span>
                </div>
                {o.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.2rem 0', color: 'var(--text-2)' }}>
                    <span>{item.name} <span style={{ color: 'var(--text-3)' }}>×{item.quantity}</span></span>
                    <span style={{ color: 'var(--text)' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.5rem', color: 'var(--text)' }}>
                  <span>Total</span><span>₹{o.totalAmount}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Invoice link */}
        {bill && (
          <a href={`/invoice/${bill._id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.8rem', background: 'var(--surface)', color: 'var(--brand)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1.5px solid var(--brand)', marginTop: '0.5rem' }}>
            🧾 View Invoice
          </a>
        )}

        {/* Rating */}
        {bill?.isPaid && !rated && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.25rem', marginTop: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginTop: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>How was your experience?</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginBottom: '1rem' }}>Your feedback helps us improve.</p>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}
                  style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', filter: n <= rating ? 'none' : 'grayscale(1)', transform: n <= rating ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s' }}>
                  ⭐
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Tell us more (optional)"
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.875rem', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: 'var(--text)' }} />
            <button onClick={submitRating} disabled={rating === 0}
              style={{ width: '100%', padding: '0.75rem', background: rating === 0 ? 'var(--border)' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: '10px', cursor: rating === 0 ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', boxShadow: rating === 0 ? 'none' : '0 4px 12px rgba(200,71,58,0.3)' }}>
              Submit Review
            </button>
          </div>
        )}

        {ratingMsg && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '0.875rem 1rem', marginTop: '1rem', color: '#166534', textAlign: 'center', fontWeight: 500 }}>
            {ratingMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;