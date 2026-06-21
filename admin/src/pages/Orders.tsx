import { useEffect, useState } from 'react';
import api from '../api';

interface Order { _id: string; tableId: { tableNo: number }; items: { name: string; quantity: number; price: number }[]; status: string; totalAmount: number; orderedAt: string; }

const STATUS_COLORS: Record<string, string> = { pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78', served: '#718096', cancelled: '#e53e3e' };
const STATUSES = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

const Orders = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) { setRestaurantId(rid); loadOrders(rid, ''); }
    });
  }, []);

  const loadOrders = (rid: string, status: string) =>
    api.get(`/orders/restaurant/${rid}${status ? `?status=${status}` : ''}`)
      .then(r => setOrders(r.data.data)).catch(() => {});

  const handleFilter = (status: string) => {
    setFilter(status);
    loadOrders(restaurantId, status);
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    loadOrders(restaurantId, filter);
  };

  const generateBill = async (orderId: string) => {
    try {
      await api.post('/bills', { orderId });
      alert('Bill generated!');
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Orders</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => handleFilter('')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filter === '' ? '#2d3748' : '#e2e8f0', color: filter === '' ? '#fff' : '#4a5568' }}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => handleFilter(s)} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filter === s ? STATUS_COLORS[s] : '#e2e8f0', color: filter === s ? '#fff' : '#4a5568', textTransform: 'capitalize' }}>{s}</button>
        ))}
      </div>

      {orders.length === 0 ? <p style={{ color: '#718096' }}>No orders found.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {orders.map(o => (
            <div key={o._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${STATUS_COLORS[o.status]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>Table {o.tableId?.tableNo}</span>
                <span style={{ background: STATUS_COLORS[o.status], color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize' }}>{o.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.75rem' }}>{new Date(o.orderedAt).toLocaleTimeString()}</div>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.2rem 0' }}>
                  <span>{item.name} ×{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f7fafc', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total</span><span>₹{o.totalAmount}</span>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUSES.filter(s => s !== o.status && s !== 'cancelled').map(s => (
                  <button key={s} onClick={() => updateStatus(o._id, s)}
                    style={{ padding: '0.3rem 0.7rem', background: STATUS_COLORS[s], color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                    → {s}
                  </button>
                ))}
                {o.status === 'served' && (
                  <button onClick={() => generateBill(o._id)}
                    style={{ padding: '0.3rem 0.7rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    🧾 Bill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
