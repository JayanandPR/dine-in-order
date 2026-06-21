import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

interface OrderItem { name: string; quantity: number; price: number; }
interface Order { _id: string; tableId: { _id: string; tableNo: number }; items: OrderItem[]; status: string; totalAmount: number; orderedAt: string; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78', served: '#718096', cancelled: '#e53e3e',
};
const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing', preparing: 'ready', ready: 'served',
};

const Orders = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  // const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.user?.restaurantId;
      if (rid) { setRestaurantId(rid); loadOrders(rid); }
    });
  }, []);

  const loadOrders = (rid: string) =>
    api.get(`/orders/restaurant/${rid}?status=pending`)
      .then(r => setOrders(r.data.data)).catch(() => {});

  const playBeep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'order:new') {
      setOrders(prev => [msg.payload, ...prev]);
      setAlert(`🔔 New order — Table ${msg.payload.tableId?.tableNo || '?'}`);
      playBeep();
      setTimeout(() => setAlert(null), 5000);
    }
    if (msg.event === 'order:status_update') {
      setOrders(prev => prev.map(o =>
        o._id === msg.payload.orderId ? { ...o, status: msg.payload.status } : o
      ));
    }
  }, []);

  useWebSocket(restaurantId, handleWsMessage);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    if (status === 'served') {
      setOrders(prev => prev.filter(o => o._id !== id));
    } else {
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    }
  };

  const generateBill = async (orderId: string) => {
    try {
      await api.post('/bills', { orderId });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setAlert('🧾 Bill generated successfully');
      setTimeout(() => setAlert(null), 3000);
    } catch (err: any) {
      setAlert(err.response?.data?.message || 'Error generating bill');
    }
  };

  const activeOrders = orders.filter(o => !['served', 'cancelled'].includes(o.status));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Live Orders</h1>
        <span style={{ background: activeOrders.length > 0 ? '#e53e3e' : '#48bb78', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
          {activeOrders.length} active
        </span>
      </div>

      {alert && (
        <div style={{ background: '#fef3c7', border: '1px solid #f6ad55', color: '#744210', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
          {alert}
        </div>
      )}

      {activeOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#718096', background: '#fff', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ margin: 0 }}>All clear! No pending orders.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {activeOrders.map(o => (
            <div key={o._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${STATUS_COLORS[o.status]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Table {o.tableId?.tableNo}</span>
                <span style={{ background: STATUS_COLORS[o.status], color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize' }}>{o.status}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.75rem' }}>
                {new Date(o.orderedAt).toLocaleTimeString()}
              </div>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.2rem 0' }}>
                  <span>{item.name} ×{item.quantity}</span>
                  <span style={{ color: '#4a5568' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f7fafc', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total</span><span>₹{o.totalAmount}</span>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {NEXT_STATUS[o.status] && (
                  <button onClick={() => updateStatus(o._id, NEXT_STATUS[o.status])}
                    style={{ flex: 1, padding: '0.5rem', background: STATUS_COLORS[NEXT_STATUS[o.status]], color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize' }}>
                    → {NEXT_STATUS[o.status]}
                  </button>
                )}
                {o.status === 'served' && (
                  <button onClick={() => generateBill(o._id)}
                    style={{ flex: 1, padding: '0.5rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                    🧾 Generate Bill
                  </button>
                )}
                <button onClick={() => updateStatus(o._id, 'cancelled')}
                  style={{ padding: '0.5rem 0.75rem', background: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;