import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  cuisineType: string;
  dietType: string;
  opensAt: string;
  closesAt: string;
  averageRating: number;
  logo?: string;
}

interface Table {
  _id: string;
  tableNo: number;
  tableCapacity: number;
  status: string;
}

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
    // Store in session storage so it persists across pages
    sessionStorage.setItem('tableId', table._id);
    sessionStorage.setItem('tableNo', String(table.tableNo));
    sessionStorage.setItem('restaurantId', restaurantId!);
    navigate(`/menu?restaurant=${restaurantId}&table=${table._id}`);
  };

  const statusColor = (s: string) =>
    s === 'available' ? '#48bb78' : s === 'occupied' ? '#e53e3e' : '#ed8936';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#718096' }}>Loading...</p>
    </div>
  );

  if (error || !restaurant) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h2>Invalid QR Code</h2>
      <p style={{ color: '#718096' }}>Please scan a valid restaurant QR code.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100vh', background: '#f7fafc', paddingBottom: '2rem' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2d3748, #4a5568)', color: '#fff', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        {restaurant.logo && (
          <img src={restaurant.logo} alt={restaurant.name}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', marginBottom: '1rem' }} />
        )}
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>{restaurant.name}</h1>
        <p style={{ margin: '0 0 0.25rem', opacity: 0.8, fontSize: '0.9rem', textTransform: 'capitalize' }}>
          {restaurant.cuisineType} cuisine · {restaurant.dietType}
        </p>
        <p style={{ margin: '0 0 0.5rem', opacity: 0.7, fontSize: '0.85rem' }}>
          📍 {restaurant.address}
        </p>
        {restaurant.averageRating > 0 && (
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            ⭐ {restaurant.averageRating.toFixed(1)}
          </p>
        )}
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🕐</div>
          <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.2rem' }}>Hours</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{restaurant.opensAt} – {restaurant.closesAt}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🪑</div>
          <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.2rem' }}>Available Tables</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {tables.filter(t => t.status === 'available').length} / {tables.length}
          </div>
        </div>
      </div>

      {/* Start ordering button */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <button onClick={() => setShowTablePicker(true)}
          style={{ width: '100%', padding: '1rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 12px rgba(45,55,72,0.3)' }}>
          🍽️ Start Ordering
        </button>
      </div>

      {/* Table picker modal */}
      {showTablePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowTablePicker(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxWidth: '480px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Select Your Table</h3>
              <button onClick={() => setShowTablePicker(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Choose the table you're sitting at.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {tables.map(t => (
                <button key={t._id}
                  onClick={() => t.status === 'available' ? selectTable(t) : null}
                  disabled={t.status !== 'available'}
                  style={{
                    padding: '1rem 0.5rem', border: `2px solid ${statusColor(t.status)}`,
                    borderRadius: '10px', background: t.status === 'available' ? '#fff' : '#f7fafc',
                    cursor: t.status === 'available' ? 'pointer' : 'not-allowed',
                    opacity: t.status === 'available' ? 1 : 0.5,
                    textAlign: 'center',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d3748' }}>T{t.tableNo}</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>Cap: {t.tableCapacity}</div>
                  <div style={{ fontSize: '0.7rem', color: statusColor(t.status), textTransform: 'capitalize', marginTop: '0.2rem' }}>
                    {t.status}
                  </div>
                </button>
              ))}
            </div>
            {tables.filter(t => t.status === 'available').length === 0 && (
              <p style={{ textAlign: 'center', color: '#e53e3e', marginTop: '1rem' }}>
                No tables available right now.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;