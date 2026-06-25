import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Restaurant {
  _id: string; name: string; address: string;
  cuisineType: string; dietType: string;
  opensAt: string; closesAt: string;
  averageRating: number; logo?: string;
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
    navigate(`/menu?restaurant=${restaurantId}&table=${table._id}`);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--surface-2)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text)' }}>Invalid QR Code</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '0.5rem' }}>Please scan a valid restaurant QR code.</p>
    </div>
  );

  const availableCount = tables.filter(t => t.status === 'available').length;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-2)', fontFamily: 'Inter, sans-serif', paddingBottom: '2rem' }}>

      {/* Hero with background image */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
        <img src={FOOD_BG} alt="restaurant"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' }} />

        {/* Restaurant logo + name */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
          {restaurant.logo && (
            <img src={restaurant.logo} alt={restaurant.name}
              style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)', marginBottom: '0.75rem', display: 'block' }} />
          )}
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '2rem', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            {restaurant.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {restaurant.cuisineType} · {restaurant.dietType}
            </span>
            {restaurant.averageRating > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                ⭐ {restaurant.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.25rem', display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-2)' }}>
          <span>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{restaurant.address}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-2)', flexShrink: 0 }}>
          <span>🕐</span>
          <span>{restaurant.opensAt} – {restaurant.closesAt}</span>
        </div>
      </div>

      {/* Welcome text */}
      <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Scan the menu, pick your favourites, and order right from your table — no waiting, no fuss.
        </p>
      </div>

      {/* Table availability card */}
      <div style={{ margin: '0 1.25rem 1.25rem', background: availableCount > 0 ? 'var(--brand-light)' : '#FFF5F5', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${availableCount > 0 ? '#F5C5BE' : '#FED7D7'}` }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: availableCount > 0 ? 'var(--brand-dark)' : '#C53030' }}>
            {availableCount > 0 ? `${availableCount} tables available` : 'No tables available'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>{tables.length} total tables</div>
        </div>
        <span style={{ fontSize: '1.75rem' }}>{availableCount > 0 ? '🪑' : '😔'}</span>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 1.25rem' }}>
        <button onClick={() => setShowTablePicker(true)} disabled={availableCount === 0}
          style={{ width: '100%', padding: '1rem', background: availableCount > 0 ? 'var(--brand)' : '#CBD5E0', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: availableCount > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em', boxShadow: availableCount > 0 ? '0 4px 16px rgba(200,71,58,0.35)' : 'none', transition: 'transform 0.1s, box-shadow 0.1s', fontFamily: 'Inter, sans-serif' }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
          {availableCount > 0 ? '🍽️ Choose Your Table & Order' : 'No Tables Available'}
        </button>
      </div>

      {/* Table picker bottom sheet */}
      {showTablePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowTablePicker(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '0', width: '100%', maxWidth: '480px', maxHeight: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px' }} />
            </div>

            <div style={{ padding: '0 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--text)' }}>Pick your table</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Only available tables can be selected.</p>
            </div>

            <div style={{ overflowY: 'auto', padding: '1rem 1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {tables.map(t => {
                  const available = t.status === 'available';
                  return (
                    <button key={t._id} onClick={() => available ? selectTable(t) : null} disabled={!available}
                      style={{ padding: '1rem 0.5rem', border: `2px solid ${available ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: available ? 'var(--brand-light)' : 'var(--surface-2)', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.5, textAlign: 'center', transition: 'transform 0.1s' }}
                      onMouseDown={e => available && (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.3rem', color: available ? 'var(--brand)' : 'var(--text-3)' }}>
                        {t.tableNo}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>
                        {t.tableCapacity} seats
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: available ? 'var(--veg)' : 'var(--text-3)', marginTop: '0.25rem' }}>
                        {t.status}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;