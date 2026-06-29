import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

interface TrackingOrder {
  _id: string;
  orderType: string;
  status: string;
  deliveryDetails: {
    address: string;
    phone: string;
    note?: string;
    status: string;
    estimatedTime?: number;
  };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryFee: number;
  orderedAt: string;
  restaurantId: { name: string; address: string; contactNumber: string };
}

type DeliveryStatus = 'placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

const STEPS: { status: DeliveryStatus; icon: string; label: string; desc: string }[] = [
  { status: 'placed',            icon: '✅', label: 'Order Placed',      desc: 'Your order has been received'         },
  { status: 'preparing',         icon: '👨‍🍳', label: 'Preparing',         desc: 'Kitchen is preparing your food'       },
  { status: 'out-for-delivery',  icon: '🛵', label: 'Out for Delivery',  desc: 'Your order is on the way'             },
  { status: 'delivered',         icon: '📦', label: 'Delivered',          desc: 'Enjoy your meal!'                     },
];

const STATUS_ORDER: DeliveryStatus[] = ['placed', 'preparing', 'out-for-delivery', 'delivered'];

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const restaurantId = params.get('restaurant') || '';

  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/track/${orderId}`)
      .then(r => setOrder(r.data.data))
      .catch(() => setError('Could not load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'delivery:status_update' && msg.payload.orderId === orderId) {
      setOrder(prev => prev ? {
        ...prev,
        deliveryDetails: { ...prev.deliveryDetails, status: msg.payload.status },
      } : prev);
    }
  }, [orderId]);

  useWebSocket('', restaurantId, handleWsMessage);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: 'var(--text-2)' }}>Loading your order...</p>
    </div>
  );

  if (error || !order) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Order not found</h2>
      <p style={{ color: 'var(--text-2)' }}>{error}</p>
    </div>
  );

  const currentStatus = order.deliveryDetails?.status as DeliveryStatus;
  const currentStep = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';
  const isDelivered = currentStatus === 'delivered';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'Inter, sans-serif', background: 'var(--surface-2)', minHeight: '100vh', paddingBottom: '2rem' }}>

      {/* Header */}
      <div style={{ background: isCancelled ? '#991B1B' : isDelivered ? '#166534' : '#6D28D9', padding: '1.5rem 1.25rem', color: '#fff' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {isCancelled ? '❌ Order Cancelled' : isDelivered ? '🎉 Delivered!' : '🛵 Tracking your order'}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{order.restaurantId?.name}</div>
        {order.deliveryDetails?.estimatedTime && !isDelivered && !isCancelled && (
          <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.4rem 0.75rem', display: 'inline-block', fontSize: '0.85rem' }}>
            ⏱ Est. {order.deliveryDetails.estimatedTime} mins
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem' }}>

        {/* Progress tracker */}
        {!isCancelled && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', color: 'var(--text)' }}>Order Progress</h3>
            <div style={{ position: 'relative' }}>
              {STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step.status} style={{ display: 'flex', gap: '1rem', marginBottom: idx < STEPS.length - 1 ? '0' : '0', position: 'relative' }}>
                    {/* Line */}
                    {idx < STEPS.length - 1 && (
                      <div style={{ position: 'absolute', left: '19px', top: '40px', width: '2px', height: '40px', background: idx < currentStep ? '#6D28D9' : 'var(--border)', transition: 'background 0.3s' }} />
                    )}
                    {/* Icon */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: done ? '#6D28D9' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, transition: 'background 0.3s', boxShadow: active ? '0 0 0 4px rgba(109,40,217,0.2)' : 'none' }}>
                      {done ? step.icon : <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-3)', display: 'block' }} />}
                    </div>
                    {/* Text */}
                    <div style={{ paddingBottom: idx < STEPS.length - 1 ? '2rem' : '0', paddingTop: '0.5rem' }}>
                      <div style={{ fontWeight: active ? 700 : done ? 600 : 400, color: done ? 'var(--text)' : 'var(--text-3)', fontSize: '0.9rem' }}>{step.label}</div>
                      {active && <div style={{ fontSize: '0.8rem', color: '#6D28D9', marginTop: '0.15rem' }}>{step.desc}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery info */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.95rem', color: 'var(--text)' }}>Delivery Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>📍</span>
              <span style={{ color: 'var(--text)' }}>{order.deliveryDetails?.address}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>📞</span>
              <span style={{ color: 'var(--text)' }}>{order.deliveryDetails?.phone}</span>
            </div>
            {order.deliveryDetails?.note && (
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>📝</span>
                <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>{order.deliveryDetails.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order items */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.95rem', color: 'var(--text)' }}>Order Summary</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
              <span>{item.name} <span style={{ color: 'var(--text-3)' }}>×{item.quantity}</span></span>
              <span style={{ color: 'var(--text)' }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          {order.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', color: '#6D28D9', borderBottom: '1px solid var(--border)' }}>
              <span>Delivery fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', paddingTop: '0.6rem', marginTop: '0.25rem', color: 'var(--text)' }}>
            <span>Total Paid</span><span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;