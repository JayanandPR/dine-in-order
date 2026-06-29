import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  cuisineType: string;
  dietType: string;
  averageRating: number;
  logo?: string;
  opensAt: string;
  closesAt: string;
  deliveryEnabled: boolean;
}

const HERO_BG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [filterDelivery, setFilterDelivery] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants/all')
      .then(r => {
        setRestaurants(r.data.data);
        setFiltered(r.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = restaurants;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.cuisineType.toLowerCase().includes(q)
      );
    }
    if (filterDelivery) {
      result = result.filter(r => r.deliveryEnabled);
    }
    setFiltered(result);
  }, [search, filterDelivery, restaurants]);

  const goToRestaurant = (id: string) => {
    navigate(`/home?restaurant=${id}`);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-2)', fontFamily: 'Inter, sans-serif', paddingBottom: '2rem' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img src={HERO_BG} alt="restaurants"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.75))' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1.75rem', margin: '0 0 0.25rem' }}>
            Dine-In-Order
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0 }}>
            Discover restaurants near you
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ padding: '1rem 1.25rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <input
          type="text"
          placeholder="🔍  Search by name, cuisine or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none', color: 'var(--text)', background: 'var(--surface-2)', marginBottom: '0.75rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterDelivery(!filterDelivery)}
            style={{ padding: '0.35rem 0.875rem', border: `1.5px solid ${filterDelivery ? '#6D28D9' : 'var(--border)'}`, borderRadius: '20px', background: filterDelivery ? '#F5F3FF' : 'var(--surface)', color: filterDelivery ? '#6D28D9' : 'var(--text-2)', fontSize: '0.8rem', fontWeight: filterDelivery ? 600 : 400, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            🛵 Delivery Available
          </button>
        </div>
      </div>

      {/* Results count */}
      <div style={{ padding: '0.875rem 1.25rem 0.25rem', color: 'var(--text-2)', fontSize: '0.825rem' }}>
        {loading ? 'Loading...' : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} found`}
      </div>

      {/* Restaurant cards */}
      <div style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0 }}>Finding restaurants...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍽️</div>
            <p style={{ margin: 0, fontWeight: 500 }}>No restaurants found</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Try a different search term</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r._id}
              onClick={() => goToRestaurant(r._id)}
              style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', marginBottom: '0.875rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', border: '1px solid var(--border)' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              }}>

              {/* Card image */}
              <div style={{ height: '140px', background: 'linear-gradient(135deg, #2d3748, #4a5568)', position: 'relative', overflow: 'hidden' }}>
                {r.logo ? (
                  <img src={r.logo} alt={r.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    🍽️
                  </div>
                )}
                {/* Badges */}
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                  {r.deliveryEnabled && (
                    <span style={{ background: '#6D28D9', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                      🛵 Delivery
                    </span>
                  )}
                  {r.averageRating > 0 && (
                    <span style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
                      ⭐ {r.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', margin: 0, color: 'var(--text)' }}>
                    {r.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                  <span style={{ background: 'var(--surface-2)', color: 'var(--text-2)', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {r.cuisineType}
                  </span>
                  <span style={{ background: r.dietType === 'veg' ? '#F0FDF4' : r.dietType === 'non-veg' ? '#FEF2F2' : 'var(--surface-2)', color: r.dietType === 'veg' ? 'var(--veg)' : r.dietType === 'non-veg' ? 'var(--nonveg)' : 'var(--text-2)', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {r.dietType}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>📍</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{r.address}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', flexShrink: 0 }}>
                    {r.opensAt} – {r.closesAt}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantList;