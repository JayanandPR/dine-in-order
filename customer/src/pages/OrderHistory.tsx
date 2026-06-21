import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useWebSocket } from '../hooks/useWebSocket';

interface OrderItem { name: string; quantity: number; price: number; }
interface Order { _id: string; status: string; totalAmount: number; orderedAt: string; items: OrderItem[]; }
interface Bill { _id: string; totalPayableAmount: number; isPaid: boolean; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78', served: '#718096', cancelled: '#e53e3e',
};

const STATUS_LABELS: Record<string, string> = {
  pending:   '⏳ Waiting',
  preparing: '👨‍🍳 Preparing',
  ready:     '✅ Ready to serve',
  served:    '🍽️ Served',
  cancelled: '❌ Cancelled',
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
    if (msg.event === 'order:status_update') {
      setOrders(prev => prev.map(o =>
        o._id === msg.payload.orderId ? { ...o, status: msg.payload.status } : o
      ));
    }
    if (msg.event === 'bill:generated') {
      setBill(msg.payload);
    }
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

  if (!tableId) return <p style={{ padding: '2rem' }}>Invalid link.</p>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f7fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <Navbar restaurantName="My Orders" />

      <div style={{ padding: '1rem' }}>
        {loading ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
            <p>No orders placed yet.</p>
          </div>
        ) : (
          orders.map(o => (
            <div key={o._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>{new Date(o.orderedAt).toLocaleTimeString()}</span>
                <span style={{ background: STATUS_COLORS[o.status], color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.15rem 0', color: '#4a5568' }}>
                  <span>{item.name} ×{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f7fafc', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                <span>Total</span><span>₹{o.totalAmount}</span>
              </div>
            </div>
          ))
        )}

        {/* Rating section */}
        {bill?.isPaid && !rated && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>Rate your experience</h3>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}
                  style={{ fontSize: '1.6rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= rating ? 1 : 0.25, transition: 'opacity 0.1s' }}>
                  ⭐
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts (optional)"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', resize: 'vertical', minHeight: '70px', boxSizing: 'border-box', marginBottom: '0.75rem' }} />
            <button onClick={submitRating} disabled={rating === 0}
              style={{ width: '100%', padding: '0.7rem', background: rating === 0 ? '#cbd5e0' : '#2d3748', color: '#fff', border: 'none', borderRadius: '8px', cursor: rating === 0 ? 'default' : 'pointer', fontWeight: 600 }}>
              Submit Review
            </button>
          </div>
        )}

        {ratingMsg && (
          <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '1rem', color: '#276749', textAlign: 'center', fontWeight: 500 }}>
            {ratingMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;