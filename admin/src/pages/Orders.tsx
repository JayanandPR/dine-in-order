import { useEffect, useState } from 'react';
import api from '../api';

interface Order {
  _id: string;
  tableId: { tableNo: number };
  items: { name: string; quantity: number; price: number }[];
  status: string;
  totalAmount: number;
  orderedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78',
  served: '#718096', cancelled: '#e53e3e',
};

const STATUS_BG: Record<string, string> = {
  pending: '#fffaf0', preparing: '#ebf8ff', ready: '#f0fff4',
  served: '#f7fafc', cancelled: '#fff5f5',
};

const STATUSES = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

const timeAgo = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

const isUrgent = (date: string, status: string) => {
  if (!['pending', 'preparing'].includes(status)) return false;
  return (Date.now() - new Date(date).getTime()) > 10 * 60 * 1000; // > 10 mins
};

const groupByDate = (orders: Order[]) => {
  const groups: Record<string, Order[]> = {};
  orders.forEach(o => {
    const d = new Date(o.orderedAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label = d.toLocaleDateString();
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';

    if (!groups[label]) groups[label] = [];
    groups[label].push(o);
  });
  return groups;
};

const Orders = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) { setRestaurantId(rid); loadOrders(rid, ''); }
    });
  }, []);

  // Refresh timestamps every 30 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
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

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
  };

  const generateBill = async (orderId: string) => {
    try {
      await api.post('/bills', { orderId });
      alert('Bill generated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const grouped = groupByDate(orders);
  const urgentCount = orders.filter(o => isUrgent(o.orderedAt, o.status)).length;

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Orders</h1>
          {urgentCount > 0 && (
            <p style={{ margin: '0.25rem 0 0', color: '#e53e3e', fontSize: '0.875rem', fontWeight: 500 }}>
              ⚠️ {urgentCount} order{urgentCount > 1 ? 's' : ''} waiting over 10 minutes
            </p>
          )}
        </div>
        <button onClick={() => loadOrders(restaurantId, filter)}
          style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#4a5568' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button onClick={() => handleFilter('')}
          style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: filter === '' ? 600 : 400, background: filter === '' ? '#2d3748' : '#e2e8f0', color: filter === '' ? '#fff' : '#4a5568' }}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => handleFilter(s)}
              style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: filter === s ? 600 : 400, background: filter === s ? STATUS_COLORS[s] : '#e2e8f0', color: filter === s ? '#fff' : '#4a5568', textTransform: 'capitalize' }}>
              {s} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {loading ? (
        <p style={{ color: '#718096' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', color: '#718096' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <p style={{ margin: 0 }}>No orders found.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dateOrders]) => (
          <div key={date} style={{ marginBottom: '2rem' }}>
            {/* Date label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2d3748' }}>{date}</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.8rem', color: '#718096' }}>{dateOrders.length} orders</span>
            </div>

            {/* Orders for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dateOrders.map(o => {
                const urgent = isUrgent(o.orderedAt, o.status);
                const expanded = expandedId === o._id;

                return (
                  <div key={o._id}
                    style={{
                      background: STATUS_BG[o.status],
                      border: `1px solid ${urgent ? '#e53e3e' : '#e2e8f0'}`,
                      borderLeft: `4px solid ${urgent ? '#e53e3e' : STATUS_COLORS[o.status]}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: urgent ? '0 0 0 2px rgba(229,62,62,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}>

                    {/* Row — always visible */}
                    <div
                      onClick={() => setExpandedId(expanded ? null : o._id)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700 }}>Table {o.tableId?.tableNo}</span>
                            {urgent && <span style={{ background: '#e53e3e', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>URGENT</span>}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.1rem' }}>
                            {o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.totalAmount} · {timeAgo(o.orderedAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: STATUS_COLORS[o.status], color: '#fff', padding: '0.2rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>
                          {o.status}
                        </span>
                        <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.875rem 1rem' }}>
                        {/* Items */}
                        <div style={{ marginBottom: '0.875rem' }}>
                          {o.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', color: '#4a5568' }}>
                              <span>{item.name} ×{item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            <span>Total</span><span>₹{o.totalAmount}</span>
                          </div>
                        </div>

                        {/* Ordered at */}
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.875rem' }}>
                          🕐 Ordered at {new Date(o.orderedAt).toLocaleTimeString()}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {o.status === 'pending' && (
                            <button onClick={() => updateStatus(o._id, 'preparing')}
                              style={{ padding: '0.45rem 1rem', background: '#4299e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                              → Preparing
                            </button>
                          )}
                          {o.status === 'preparing' && (
                            <button onClick={() => updateStatus(o._id, 'ready')}
                              style={{ padding: '0.45rem 1rem', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                              → Ready
                            </button>
                          )}
                          {o.status === 'ready' && (
                            <button onClick={() => updateStatus(o._id, 'served')}
                              style={{ padding: '0.45rem 1rem', background: '#718096', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                              → Served
                            </button>
                          )}
                          {o.status === 'served' && (
                            <button onClick={() => generateBill(o._id)}
                              style={{ padding: '0.45rem 1rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                              🧾 Generate Bill
                            </button>
                          )}
                          {!['served', 'cancelled'].includes(o.status) && (
                            <button onClick={() => updateStatus(o._id, 'cancelled')}
                              style={{ padding: '0.45rem 1rem', background: '#fff', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;