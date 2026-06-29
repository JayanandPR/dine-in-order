import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Restaurant {
  _id: string; name: string; address: string;
  cuisineType: string; dietType: string;
  opensAt: string; closesAt: string;
  averageRating: number; logo?: string;
  deliveryEnabled: boolean; deliveryFee: number;
  minOrderAmount: number; estimatedDeliveryTime: number;
}
interface Table {
  _id: string; tableNo: number; tableCapacity: number; status: string;
}

const FOOD_BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';

const Home = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = params.get('restaurant');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ address: '', phone: '', note: '' });
  const [deliveryError, setDeliveryError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) { setError('Invalid QR code'); setLoading(false); return; }
    Promise.all([
      api.get(`/restaurants/${restaurantId}/public`),
      api.get(`/restaurants/${restaurantId}/tables/public`),
    ]).then(([rRes, tRes]) => {
      setRestaurant(rRes.data.data);
      setTables(tRes.data.data);
    }).catch(() => setError('Could not load restaurant'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const selectTable = (table: Table) => {
    sessionStorage.setItem('tableId', table._id);
    sessionStorage.setItem('tableNo', String(table.tableNo));
    sessionStorage.setItem('restaurantId', restaurantId!);
    sessionStorage.setItem('orderType', 'dine-in');
    navigate(`/menu?restaurant=${restaurantId}&table=${table._id}`);
  };

  const handleDeliverySubmit = () => {
    setDeliveryError('');
    if (!deliveryForm.address.trim()) { setDeliveryError('Please enter your delivery address'); return; }
    if (!deliveryForm.phone.trim() || deliveryForm.phone.length < 10) { setDeliveryError('Please enter a valid phone number'); return; }

    sessionStorage.setItem('orderType', 'delivery');
    sessionStorage.setItem('restaurantId', restaurantId!);
    sessionStorage.setItem('deliveryAddress', deliveryForm.address);
    sessionStorage.setItem('deliveryPhone', deliveryForm.phone);
    sessionStorage.setItem('deliveryNote', deliveryForm.note);
    navigate(`/menu?restaurant=${restaurantId}&orderType=delivery`);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Loading your menu...</p>
      </div>
    </div>
  );

  if (error || !restaurant) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Invalid QR Code</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '0.5rem' }}>Please scan a valid restaurant QR code.</p>
    </div>
  );

  const availableCount = tables.filter(t => t.status === 'available').length;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-2)', fontFamily: 'Inter, sans-serif', paddingBottom: '2rem' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        <img src={FOOD_BG} alt="restaurant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
          {restaurant.logo && (
            <img src={restaurant.logo} alt={restaurant.name}
              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', marginBottom: '0.6rem', display: 'block' }} />
          )}
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1.9rem', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            {restaurant.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {restaurant.cuisineType} · {restaurant.dietType}
            </span>
            {restaurant.averageRating > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                ⭐ {restaurant.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.25rem', display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-2)' }}>
          <span>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{restaurant.address}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-2)', flexShrink: 0 }}>
          <span>🕐</span>
          <span>{restaurant.opensAt} – {restaurant.closesAt}</span>
        </div>
      </div>

      {/* Order options */}
      <div style={{ padding: '1.25rem' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          How would you like to order?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: restaurant.deliveryEnabled ? '1fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Dine In */}
          <button onClick={() => setShowTablePicker(true)} disabled={availableCount === 0}
            style={{ padding: '1.25rem 1rem', background: availableCount > 0 ? 'var(--surface)' : 'var(--surface-2)', border: `2px solid ${availableCount > 0 ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: availableCount > 0 ? 'pointer' : 'not-allowed', textAlign: 'center', opacity: availableCount === 0 ? 0.6 : 1, transition: 'transform 0.1s, box-shadow 0.1s', boxShadow: availableCount > 0 ? '0 2px 8px rgba(200,71,58,0.15)' : 'none' }}
            onMouseEnter={e => availableCount > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🍽️</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Dine In</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>
              {availableCount > 0 ? `${availableCount} tables free` : 'No tables free'}
            </div>
          </button>

          {/* Delivery */}
          {restaurant.deliveryEnabled && (
            <button onClick={() => setShowDeliveryForm(true)}
              style={{ padding: '1.25rem 1rem', background: 'var(--surface)', border: '2px solid #6D28D9', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s, box-shadow 0.1s', boxShadow: '0 2px 8px rgba(109,40,217,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🛵</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Delivery</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>
                {restaurant.estimatedDeliveryTime} mins · ₹{restaurant.deliveryFee} fee
              </div>
            </button>
          )}
        </div>

        {/* Delivery info pills */}
        {restaurant.deliveryEnabled && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#F5F3FF', color: '#6D28D9', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
              🛵 ₹{restaurant.deliveryFee} delivery fee
            </span>
            <span style={{ background: '#F5F3FF', color: '#6D28D9', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
              ⏱ ~{restaurant.estimatedDeliveryTime} mins
            </span>
            {restaurant.minOrderAmount > 0 && (
              <span style={{ background: '#F5F3FF', color: '#6D28D9', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                🛒 Min ₹{restaurant.minOrderAmount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table picker bottom sheet */}
      {showTablePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowTablePicker(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px' }} />
            </div>
            <div style={{ padding: '0.75rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', margin: 0 }}>Pick your table</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginTop: '0.25rem', marginBottom: 0 }}>Only available tables can be selected.</p>
            </div>
            <div style={{ overflowY: 'auto', padding: '1rem 1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {tables.map(t => {
                  const available = t.status === 'available';
                  return (
                    <button key={t._id} onClick={() => available ? selectTable(t) : null} disabled={!available}
                      style={{ padding: '1rem 0.5rem', border: `2px solid ${available ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: available ? 'var(--brand-light)' : 'var(--surface-2)', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.5, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.3rem', color: available ? 'var(--brand)' : 'var(--text-3)' }}>{t.tableNo}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>{t.tableCapacity} seats</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: available ? 'var(--veg)' : 'var(--text-3)', marginTop: '0.2rem' }}>{t.status}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery form bottom sheet */}
      {showDeliveryForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowDeliveryForm(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px' }} />
            </div>

            <div style={{ padding: '0.75rem 1.25rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', margin: 0 }}>Delivery Details</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginTop: '0.2rem', marginBottom: 0 }}>We'll deliver to your address in ~{restaurant.estimatedDeliveryTime} mins</p>
              </div>
              <button onClick={() => setShowDeliveryForm(false)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '1.25rem' }}>
              {deliveryError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.6rem 0.9rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem' }}>
                  {deliveryError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                  📍 Delivery Address *
                </label>
                <textarea value={deliveryForm.address}
                  onChange={e => setDeliveryForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Enter your full address including landmark..."
                  rows={3}
                  style={{ width: '100%', padding: '0.7rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', resize: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none', color: 'var(--text)' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                  📞 Phone Number *
                </label>
                <input type="tel" value={deliveryForm.phone}
                  onChange={e => setDeliveryForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  style={{ width: '100%', padding: '0.7rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none', color: 'var(--text)' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                  📝 Delivery Note <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input type="text" value={deliveryForm.note}
                  onChange={e => setDeliveryForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="e.g. Ring the bell, 2nd floor..."
                  style={{ width: '100%', padding: '0.7rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none', color: 'var(--text)' }} />
              </div>

              {/* Order summary strip */}
              {restaurant.deliveryFee > 0 && (
                <div style={{ background: '#F5F3FF', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#6D28D9' }}>Delivery fee</span>
                  <span style={{ fontWeight: 700, color: '#6D28D9' }}>₹{restaurant.deliveryFee}</span>
                </div>
              )}

              <button onClick={handleDeliverySubmit}
                style={{ width: '100%', padding: '0.9rem', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(109,40,217,0.3)' }}>
                Continue to Menu →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;