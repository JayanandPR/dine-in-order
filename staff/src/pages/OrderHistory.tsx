import { useEffect, useState } from 'react';
import api from '../api';

interface OrderItem { name: string; quantity: number; price: number; }
interface Order { _id: string; tableId: { tableNo: number }; items: OrderItem[]; status: string; totalAmount: number; orderedAt: string; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78', served: '#718096', cancelled: '#e53e3e',
};
const STATUSES = ['', 'pending', 'preparing', 'ready', 'served', 'cancelled'];

const OrderHistory = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.user?.restaurantId;
      if (rid) { setRestaurantId(rid); loadOrders(rid, ''); }
    });
  }, []);

  const loadOrders = (rid: string, status: string) => {
    setLoading(true);
    api.get(`/orders/restaurant/${rid}${status ? `?status=${status}` : ''}`)
      .then(r => setOrders(r.data.data))
      .finally(() => setLoading(false));
  };

  const handleFilter = (status: string) => {
    setFilter(status);
    loadOrders(restaurantId, status);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Order History</h1>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => handleFilter(s)}
            style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: filter === s ? 600 : 400, background: filter === s ? (STATUS_COLORS[s] || '#2d3748') : '#e2e8f0', color: filter === s ? '#fff' : '#4a5568' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#718096' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', color: '#718096' }}>No orders found.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Table', 'Items', 'Total', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} style={{ borderTop: '1px solid #f7fafc' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Table {o.tableId?.tableNo}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#4a5568' }}>
                    {o.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{o.totalAmount}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: STATUS_COLORS[o.status], color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#718096' }}>
                    {new Date(o.orderedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;