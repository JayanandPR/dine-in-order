import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useWebSocket } from '../hooks/useWebSocket';

interface Restaurant { _id: string; name: string; cuisineType: string; dietType: string; }
interface Category { _id: string; name: string; }
interface FoodItem { _id: string; name: string; price: number; description: string; dietType: string; availability: boolean; image?: string; categoryId: { _id: string; name: string } | string; }
interface CartItem { _id: string; foodItemId: { _id: string; name: string; price: number; image?: string }; quantity: number; totalPrice: number; }

// Fallback food images by diet type
const FALLBACK_IMAGES = {
  veg: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'non-veg': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80',
  vegan: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=200&q=80',
};

const Menu = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orderType = params.get('orderType') || sessionStorage.getItem('orderType') || 'dine-in';
  const isDelivery = orderType === 'delivery';
  const deliveryAddress = sessionStorage.getItem('deliveryAddress') || '';
  const deliveryPhone = sessionStorage.getItem('deliveryPhone') || '';
  const deliveryNote = sessionStorage.getItem('deliveryNote') || '';

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
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    if (!isDelivery && !tableId) return;
    api.get(`/restaurants/${restaurantId}/public`).then(r => setRestaurant(r.data.data)).catch(() => setError('Invalid restaurant'));
    api.get(`/menu/${restaurantId}/categories`).then(r => { setCategories(r.data.data); if (r.data.data[0]) setActiveCategory(r.data.data[0]._id); });
    api.get(`/menu/${restaurantId}/items`).then(r => setItems(r.data.data));
    if (!isDelivery && tableId) {
      api.get(`/cart/${tableId}`).then(r => setCart(r.data.data)).catch(() => {});
      api.get(`/bills/table/${tableId}`).then(r => { if (r.data.data) setBill(r.data.data); }).catch(() => {});
      api.get(`/orders/table/${tableId}`).then(r => {
        const active = r.data.data.find((o: any) => !['served', 'cancelled'].includes(o.status));
        if (active) setOrderStatus(active.status);
      }).catch(() => {});
    }
  }, [restaurantId, tableId]);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'order:status_update') setOrderStatus(msg.payload.status);
    if (msg.event === 'bill:generated') setBill(msg.payload);
  }, []);

  useWebSocket(tableId || '', restaurantId || '', handleWsMessage);

  if (!restaurantId) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--surface-2)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Invalid QR Code</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '0.5rem' }}>Scan a valid restaurant QR code to order.</p>
    </div>
  );

  if (!isDelivery && !tableId) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--surface-2)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>No Table Selected</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '0.5rem' }}>Please scan a table QR code or go back and select a table.</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--surface-2)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '0.5rem' }}>{error}</p>
    </div>
  );

  const addToCart = async (item: FoodItem) => {
    setAddingId(item._id);
    try {
      await api.post('/cart', {
        tableId: isDelivery ? undefined : tableId,
        foodItemId: item._id,
        quantity: 1,
        orderType,
        restaurantId,
        deliveryDetails: isDelivery ? { address: deliveryAddress, phone: deliveryPhone, note: deliveryNote } : undefined,
      });
      const updated = await api.get(`/cart/${isDelivery ? `delivery/${restaurantId}` : tableId}`);
      setCart(updated.data.data);
    } catch (err: any) { alert(err.response?.data?.message || 'Could not add item'); }
    finally { setAddingId(null); }
  };

  const updateCartQty = async (cartItemId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await api.delete(`/cart/${cartItemId}`);
      setCart(prev => prev.filter(c => c._id !== cartItemId));
    } else {
      await api.patch(`/cart/${cartItemId}`, { quantity: newQty });
      const updated = await api.get(`/cart/${tableId}`);
      setCart(updated.data.data);
    }
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        tableId: isDelivery ? undefined : tableId,
        restaurantId,
        orderType,
        deliveryDetails: isDelivery ? {
          address: deliveryAddress,
          phone: deliveryPhone,
          note: deliveryNote,
        } : undefined,
      });
      const orderId = res.data.data._id;
      setCart([]);
      setOrderPlaced(true);
      setShowCart(false);
      if (isDelivery) {
        // Go to tracking page for delivery orders
        navigate(`/track/${orderId}?restaurant=${restaurantId}`);
      } else {
        setOrderStatus('pending');
      }
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
        theme: { color: '#C8473A' },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) { alert(err.response?.data?.message || 'Payment error'); }
  };

  const filteredItems = items.filter(i => {
    const catId = typeof i.categoryId === 'object' ? i.categoryId._id : i.categoryId;
    return catId === activeCategory && i.availability;
  });

  const cartTotal = cart.reduce((s, c) => s + c.totalPrice, 0);

  const getCartQty = (foodItemId: string) => {
    const found = cart.find(c => c.foodItemId?._id === foodItemId);
    return found ? { qty: found.quantity, cartId: found._id } : null;
  };

  const statusBanner: Record<string, { bg: string; color: string; icon: string; text: string }> = {
    pending:   { bg: '#FFF7ED', color: '#92400E', icon: '⏳', text: 'Order received — waiting to be prepared' },
    preparing: { bg: '#EFF6FF', color: '#1E40AF', icon: '👨‍🍳', text: 'Your food is being prepared' },
    ready:     { bg: '#F0FDF4', color: '#166534', icon: '✅', text: 'Ready! Staff will serve you shortly' },
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--surface-2)', minHeight: '100vh', paddingBottom: '6rem', fontFamily: 'Inter, sans-serif' }}>
      <Navbar restaurantName={restaurant?.name} cartCount={cart.length} onCartClick={() => setShowCart(true)} />
      
      {/* Delivery banner */}
      {isDelivery && (
        <div style={{ background: '#F5F3FF', borderBottom: '1px solid #DDD6FE', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6D28D9' }}>
          <span>🛵</span>
          <span style={{ fontWeight: 500 }}>Delivering to:</span>
          <span style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryAddress}</span>
        </div>
      )}

      {/* Status banner */}
      {orderStatus && statusBanner[orderStatus] && (
        <div style={{ background: statusBanner[orderStatus].bg, color: statusBanner[orderStatus].color, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '1.1rem' }}>{statusBanner[orderStatus].icon}</span>
          {statusBanner[orderStatus].text}
        </div>
      )}

      {/* Bill banner */}
      {bill && !bill.isPaid && (
        <div style={{ background: 'var(--brand)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Your bill is ready</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>₹{bill.totalPayableAmount.toFixed(2)}</div>
          </div>
          <button onClick={handlePayment}
            style={{ background: '#fff', color: 'var(--brand)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
            Pay Now
          </button>
        </div>
      )}

      {/* Order placed notice */}
      {orderPlaced && (
        <div style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem', fontWeight: 500 }}>
          ✅ Order placed! We'll start preparing it shortly.
        </div>
      )}

      {/* Category tabs */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1rem', display: 'flex', overflowX: 'auto', gap: '0', scrollbarWidth: 'none' }}>
        <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>
        {categories.map(c => (
          <button key={c._id} onClick={() => setActiveCategory(c._id)}
            style={{ padding: '0.875rem 1rem', border: 'none', borderBottom: activeCategory === c._id ? '2.5px solid var(--brand)' : '2.5px solid transparent', marginBottom: '-1px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeCategory === c._id ? 600 : 400, color: activeCategory === c._id ? 'var(--brand)' : 'var(--text-2)', fontSize: '0.875rem', transition: 'color 0.15s', fontFamily: 'Inter, sans-serif' }}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Food items */}
      <div style={{ padding: '1rem' }}>
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
            <p>No items in this category.</p>
          </div>
        )}
        {filteredItems.map(item => {
          const cartInfo = getCartQty(item._id);
          const imgSrc = item.image || FALLBACK_IMAGES[item.dietType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.veg;

          return (
            <div key={item._id}
              style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', minHeight: '110px' }}>

              {/* Food image */}
              <img src={imgSrc} alt={item.name}
                style={{ width: '110px', height: '110px', objectFit: 'cover', flexShrink: 0 }} />

              {/* Content */}
              <div style={{ flex: 1, padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    {/* Diet indicator */}
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', border: `2px solid ${item.dietType === 'veg' || item.dietType === 'vegan' ? 'var(--veg)' : 'var(--nonveg)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.dietType === 'veg' || item.dietType === 'vegan' ? 'var(--veg)' : 'var(--nonveg)', display: 'block' }} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text)' }}>{item.name}</span>
                  </div>
                  {item.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', margin: '0 0 0.35rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>₹{item.price}</span>

                  {/* Add / Qty control */}
                  {cartInfo ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand-light)', borderRadius: '8px', padding: '0.2rem 0.3rem' }}>
                      <button onClick={() => updateCartQty(cartInfo.cartId, -1, cartInfo.qty)}
                        style={{ width: '26px', height: '26px', border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                        −
                      </button>
                      <span style={{ fontWeight: 700, color: 'var(--brand)', minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{cartInfo.qty}</span>
                      <button onClick={() => updateCartQty(cartInfo.cartId, 1, cartInfo.qty)}
                        style={{ width: '26px', height: '26px', border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} disabled={addingId === item._id}
                      style={{ background: addingId === item._id ? 'var(--border)' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background 0.15s', fontFamily: 'Inter, sans-serif' }}>
                      {addingId === item._id ? '...' : 'Add'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart FAB */}
      {cart.length > 0 && !showCart && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'calc(100% - 2.5rem)', maxWidth: '430px' }}>
          <button onClick={() => setShowCart(true)}
            style={{ width: '100%', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.9rem 1.5rem', cursor: 'pointer', fontWeight: 700, boxShadow: '0 8px 24px rgba(200,71,58,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.85rem' }}>{cart.length} items</span>
            <span>View Cart</span>
            <span style={{ fontWeight: 700 }}>₹{cartTotal.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Cart bottom sheet */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200 }} onClick={() => setShowCart(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'var(--surface)', borderRadius: '20px 20px 0 0', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px' }} />
            </div>

            <div style={{ padding: '0.75rem 1.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--text)' }}>Your Cart</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '0.75rem 1.25rem', flex: 1 }}>
              {cart.map(c => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)' }}>{c.foodItemId?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>₹{c.foodItemId?.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--brand-light)', borderRadius: '8px', padding: '0.2rem 0.3rem' }}>
                      <button onClick={() => updateCartQty(c._id, -1, c.quantity)}
                        style={{ width: '24px', height: '24px', border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: '5px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>−</button>
                      <span style={{ fontWeight: 700, color: 'var(--brand)', minWidth: '18px', textAlign: 'center', fontSize: '0.875rem' }}>{c.quantity}</span>
                      <button onClick={() => updateCartQty(c._id, 1, c.quantity)}
                        style={{ width: '24px', height: '24px', border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: '5px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text)', minWidth: '50px', textAlign: 'right' }}>₹{c.totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Subtotal</span>
                <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>₹{cartTotal.toFixed(2)}</span>
              </div>
              {isDelivery && restaurant && (restaurant as any).deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Delivery fee</span>
                  <span style={{ color: '#6D28D9', fontSize: '0.875rem' }}>₹{(restaurant as any).deliveryFee}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                  ₹{(cartTotal + (isDelivery && restaurant ? (restaurant as any).deliveryFee : 0)).toFixed(2)}
                </span>
              </div>
              <button onClick={placeOrder} disabled={placing}
                style={{ width: '100%', padding: '0.9rem', background: placing ? 'var(--border)' : isDelivery ? '#6D28D9' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: placing ? 'default' : 'pointer', fontWeight: 700, fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                {placing ? 'Placing order...' : isDelivery ? '🛵 Place Delivery Order' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;