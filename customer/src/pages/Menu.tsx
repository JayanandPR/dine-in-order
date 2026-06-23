import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useWebSocket } from '../hooks/useWebSocket';

interface Restaurant { _id: string; name: string; cuisineType: string; dietType: string; }
interface Category { _id: string; name: string; }
interface FoodItem { _id: string; name: string; price: number; description: string; dietType: string; availability: boolean; image?: string; categoryId: { _id: string; name: string } | string; }
interface CartItem { _id: string; foodItemId: { _id: string; name: string; price: number; image?: string }; quantity: number; totalPrice: number; }

const dietDot = (d: string): React.CSSProperties => ({
  width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block', border: '1px solid #ccc',
  background: d === 'veg' ? '#48bb78' : d === 'vegan' ? '#38b2ac' : '#e53e3e',
});

const Menu = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = params.get('restaurant') || sessionStorage.getItem('restaurantId');
  const tableId = params.get('table') || sessionStorage.getItem('tableId');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [bill, setBill] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!restaurantId || !tableId) return;

    api.get(`/restaurants/${restaurantId}/public`).then(r => setRestaurant(r.data.data)).catch(() => setError('Invalid restaurant'));
    api.get(`/menu/${restaurantId}/categories`).then(r => { setCategories(r.data.data); if (r.data.data[0]) setActiveCategory(r.data.data[0]._id); });
    api.get(`/menu/${restaurantId}/items`).then(r => setItems(r.data.data));
    api.get(`/cart/${tableId}`).then(r => setCart(r.data.data)).catch(() => {});
    api.get(`/bills/table/${tableId}`).then(r => { if (r.data.data) setBill(r.data.data); }).catch(() => {});

    // Resume active order status
    api.get(`/orders/table/${tableId}`).then(r => {
      const active = r.data.data.find((o: any) => !['served', 'cancelled'].includes(o.status));
      if (active) setOrderStatus(active.status);
    }).catch(() => {});
  }, [restaurantId, tableId]);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'order:status_update') {
      setOrderStatus(msg.payload.status);
    }
    if (msg.event === 'bill:generated') {
      setBill(msg.payload);
    }
  }, []);

  useWebSocket(tableId || '', restaurantId || '', handleWsMessage);

  if (!tableId || !restaurantId) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2>Invalid QR Code</h2>
      <p style={{ color: '#718096' }}>Please scan a valid table QR code to order.</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2>Something went wrong</h2>
      <p style={{ color: '#718096' }}>{error}</p>
    </div>
  );

  const addToCart = async (item: FoodItem) => {
    try {
      await api.post('/cart', { tableId, foodItemId: item._id, quantity: 1 });
      const updated = await api.get(`/cart/${tableId}`);
      setCart(updated.data.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Could not add item'); }
  };

  const removeFromCart = async (cartItemId: string) => {
    await api.delete(`/cart/${cartItemId}`);
    setCart(prev => prev.filter(c => c._id !== cartItemId));
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      await api.post('/orders', { tableId });
      setCart([]);
      setOrderPlaced(true);
      setOrderStatus('pending');
      setShowCart(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Error placing order'); }
    finally { setPlacing(false); }
  };

  const handlePayment = async () => {
    if (!bill) return;
    try {
      const { data } = await api.post('/bills/create-payment', { billId: bill._id });
      const { orderId, amount, currency } = data.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount, currency,
        name: restaurant?.name,
        description: 'Table bill payment',
        order_id: orderId,
        handler: async (response: any) => {
          await api.post('/bills/verify-payment', {
            billId: bill._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setBill((b: any) => ({ ...b, isPaid: true }));
          navigate(`/thankyou?table=${tableId}&restaurant=${restaurantId}`);
        },
        theme: { color: '#2d3748' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) { alert(err.response?.data?.message || 'Payment error'); }
  };

  const filteredItems = items.filter(i => {
    const catId = typeof i.categoryId === 'object' ? i.categoryId._id : i.categoryId;
    return catId === activeCategory && i.availability;
  });

  const cartTotal = cart.reduce((s, c) => s + c.totalPrice, 0);

  const statusBannerColor: Record<string, { bg: string; text: string; border: string }> = {
    pending:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    preparing: { bg: '#ebf8ff', text: '#2b6cb0', border: '#90cdf4' },
    ready:     { bg: '#f0fff4', text: '#276749', border: '#9ae6b4' },
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f7fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar
        restaurantName={restaurant?.name}
        cartCount={cart.length}
        onCartClick={() => setShowCart(true)}
      />

      {/* Order status banner */}
      {orderStatus && statusBannerColor[orderStatus] && (
        <div style={{ background: statusBannerColor[orderStatus].bg, border: `1px solid ${statusBannerColor[orderStatus].border}`, color: statusBannerColor[orderStatus].text, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {orderStatus === 'pending'   && '⏳ Your order is received and waiting to be prepared'}
          {orderStatus === 'preparing' && '👨‍🍳 Your order is being prepared'}
          {orderStatus === 'ready'     && '✅ Your order is ready! Staff will serve you shortly'}
        </div>
      )}

      {/* Bill ready banner */}
      {bill && !bill.isPaid && (
        <div style={{ background: '#fef3c7', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fcd34d' }}>
          <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>🧾 Bill ready: ₹{bill.totalPayableAmount.toFixed(2)}</span>
          <button onClick={handlePayment}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            Pay Now
          </button>
        </div>
      )}

      {/* Order placed notice */}
      {orderPlaced && (
        <div style={{ background: '#f0fff4', padding: '0.75rem 1rem', textAlign: 'center', color: '#276749', fontSize: '0.875rem', fontWeight: 500 }}>
          ✅ Order placed! We'll start preparing it shortly.
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '2px solid #e2e8f0', background: '#fff', padding: '0 0.5rem' }}>
        {categories.map(c => (
          <button key={c._id} onClick={() => setActiveCategory(c._id)}
            style={{ padding: '0.75rem 1rem', border: 'none', borderBottom: activeCategory === c._id ? '2px solid #2d3748' : '2px solid transparent', marginBottom: '-2px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeCategory === c._id ? 600 : 400, color: activeCategory === c._id ? '#2d3748' : '#718096', fontSize: '0.875rem' }}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: '0.75rem' }}>
        {filteredItems.length === 0 && (
          <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>No items in this category.</p>
        )}
        {filteredItems.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span style={dietDot(item.dietType)} />
                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</span>
              </div>
              {item.description && <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0 0 0.25rem' }}>{item.description}</p>}
              <span style={{ fontWeight: 600, color: '#2d3748' }}>₹{item.price}</span>
            </div>
            {item.image && (
              <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginLeft: '0.75rem' }} />
            )}
            <button onClick={() => addToCart(item)}
              style={{ marginLeft: '0.75rem', width: '34px', height: '34px', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0 }}>
              +
            </button>
          </div>
        ))}
      </div>

      {/* Cart FAB */}
      {cart.length > 0 && !showCart && (
        <button onClick={() => setShowCart(true)}
          style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '24px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100, whiteSpace: 'nowrap' }}>
          🛒 {cart.length} items · ₹{cartTotal.toFixed(0)}
        </button>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} onClick={() => setShowCart(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Your Cart</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            {cart.map(c => (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f7fafc' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.foodItemId?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>₹{c.foodItemId?.price} × {c.quantity}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>₹{c.totalPrice.toFixed(0)}</span>
                  <button onClick={() => removeFromCart(c._id)}
                    style={{ background: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem' }}>
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', padding: '0.75rem 0' }}>
              <span>Total</span><span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <button onClick={placeOrder} disabled={placing}
              style={{ width: '100%', padding: '0.875rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
              {placing ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;