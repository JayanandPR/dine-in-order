import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

interface DeliveryOrder {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryFee: number;
  deliveryDetails: {
    address: string;
    phone: string;
    note?: string;
    status: string;
    estimatedTime?: number;
  };
  orderedAt: string;
}

type DeliveryStatus = 'placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  placed:             { color: '#92400E', bg: '#FFF7ED', label: '📦 Placed' },
  preparing:          { color: '#1E40AF', bg: '#EFF6FF', label: '👨‍🍳 Preparing' },
  'out-for-delivery': { color: '#6D28D9', bg: '#F5F3FF', label: '🛵 Out for Delivery' },
  delivered:          { color: '#166534', bg: '#F0FDF4', label: '✅ Delivered' },
  cancelled:          { color: '#991B1B', bg: '#FEF2F2', label: '❌ Cancelled' },
};

const NEXT_STATUS: Record<string, DeliveryStatus> = {
  placed:            'preparing',
  preparing:         'out-for-delivery',
  'out-for-delivery':'delivered',
};

const timeAgo = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const Deliveries = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.user?.restaurantId;
      const enabled = data.data.restaurant?.deliveryEnabled;
      if (rid) {
        setRestaurantId(rid);
        setDeliveryEnabled(enabled || false);
        loadOrders(rid);
      }
    });
  }, []);

  // Refresh timestamps every 30s
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const loadOrders = (rid: string) => {
    setLoading(true);
    api.get(`/orders/delivery/${rid}`)
      .then(r => setOrders(r.data.data))
      .finally(() => setLoading(false));
  };

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'order:new' && msg.payload.orderType === 'delivery') {
      setOrders(prev => [msg.payload, ...prev]);
      setNewAlert(`🛵 New delivery order!`);
      setTimeout(() => setNewAlert(null), 5000);
    }
    if (msg.event === 'delivery:status_update') {
      setOrders(prev => prev.map(o =>
        o._id === msg.payload.orderId
          ? { ...o, deliveryDetails: { ...o.deliveryDetails, status: msg.payload.status } }
          : o
      ));
    }
  }, []);

  useWebSocket(restaurantId, handleWsMessage);

  const updateStatus = async (id: string, status: DeliveryStatus) => {
    await api.patch(`/orders/${id}/delivery-status`, { status });
    setOrders(prev => prev.map(o =>
      o._id === id ? { ...o, deliveryDetails: { ...o.deliveryDetails, status } } : o
    ));
  };

  const activeOrders = orders.filter(o =>
    !['delivered', 'cancelled'].includes(o.deliveryDetails?.status)
  );

  if (!deliveryEnabled) return (
    <div style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>Deliveries</h1>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛵</div>
        <h3 style={{ marginTop: 0 }}>Delivery not enabled</h3>
        <p style={{ color: '#718096' }}>Ask your admin to enable delivery in restaurant settings.</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Deliveries</h1>
          {activeOrders.length > 0 && (
            <p style={{ margin: '0.25rem 0 0', color: '#6D28D9', fontSize: '0.875rem', fontWeight: 500 }}>
              🛵 {activeOrders.length} active delivery order{activeOrders.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={() => loadOrders(restaurantId)}
          style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#4a5568' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Alert */}
      {newAlert && (
        <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#6D28D9', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
          {newAlert}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = orders.filter(o => o.deliveryDetails?.status === status).length;
          return (
            <div key={status} style={{ background: cfg.bg, borderRadius: '10px', padding: '0.875rem', border: `1px solid ${cfg.color}22` }}>
              <div style={{ fontWeight: 700, fontSize: '1.4rem', color: cfg.color }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.1rem' }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: '#718096' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', color: '#718096' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛵</div>
          <p style={{ margin: 0 }}>No delivery orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orders.map(o => {
            const cfg = STATUS_CONFIG[o.deliveryDetails?.status] || STATUS_CONFIG.placed;
            const expanded = expandedId === o._id;
            const nextStatus = NEXT_STATUS[o.deliveryDetails?.status];
            const isActive = !['delivered', 'cancelled'].includes(o.deliveryDetails?.status);

            return (
              <div key={o._id}
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderLeft: `4px solid ${cfg.color}`, borderRadius: '10px', overflow: 'hidden' }}>

                {/* Collapsed row */}
                <div onClick={() => setExpandedId(expanded ? null : o._id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.15rem' }}>
                      🛵 {o.deliveryDetails?.address?.substring(0, 35)}{(o.deliveryDetails?.address?.length || 0) > 35 ? '...' : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                      {o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.totalAmount} · {timeAgo(o.orderedAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: cfg.color, color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {cfg.label}
                    </span>
                    <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded */}
                {expanded && (
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '1rem' }}>

                    {/* Customer info */}
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.875rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Info</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <span style={{ color: '#718096' }}>📍</span>
                          <span style={{ color: '#2d3748' }}>{o.deliveryDetails?.address}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}>
                          <span style={{ color: '#718096' }}>📞</span>
                          <a href={`tel:${o.deliveryDetails?.phone}`}
                            style={{ color: '#4299e1', textDecoration: 'none', fontWeight: 500 }}>
                            {o.deliveryDetails?.phone}
                          </a>
                        </div>
                        {o.deliveryDetails?.note && (
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#718096' }}>📝</span>
                            <span style={{ color: '#4a5568', fontStyle: 'italic' }}>{o.deliveryDetails.note}</span>
                          </div>
                        )}
                        {o.deliveryDetails?.estimatedTime && (
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#718096' }}>⏱</span>
                            <span style={{ color: '#2d3748' }}>Est. {o.deliveryDetails.estimatedTime} mins</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '0.875rem' }}>
                      {o.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', color: '#4a5568', borderBottom: '1px solid #f7fafc' }}>
                          <span>{item.name} ×{item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {o.deliveryFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', color: '#6D28D9' }}>
                          <span>Delivery fee</span>
                          <span>₹{o.deliveryFee}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '0.5rem 0 0', borderTop: '1px solid #e2e8f0', marginTop: '0.25rem' }}>
                        <span>Total</span><span>₹{o.totalAmount}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isActive && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {nextStatus && (
                          <button onClick={() => updateStatus(o._id, nextStatus)}
                            style={{ flex: 1, padding: '0.55rem 1rem', background: STATUS_CONFIG[nextStatus].color, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                            → {STATUS_CONFIG[nextStatus].label}
                          </button>
                        )}
                        <button onClick={() => updateStatus(o._id, 'cancelled')}
                          style={{ padding: '0.55rem 1rem', background: '#fff', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deliveries;