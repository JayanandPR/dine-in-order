import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

interface Stats { tables: number; pendingOrders: number; totalBills: number; }

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
    <div style={{ color: '#718096', marginTop: '0.25rem', fontSize: '0.9rem' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ tables: 0, pendingOrders: 0, totalBills: 0 });
  const [restaurantId, setRestaurantId] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      if (data.data.restaurant) {
        const rid = data.data.restaurant._id;
        setRestaurantId(rid);
        Promise.all([
          api.get(`/tables/${rid}`),
          api.get(`/orders/restaurant/${rid}?status=pending`),
          api.get(`/bills/restaurant/${rid}`),
        ]).then(([t, o, b]) => setStats({
          tables:        t.data.data.length,
          pendingOrders: o.data.data.length,
          totalBills:    b.data.data.length,
        })).catch(() => {});
      }
    });
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>Welcome back, {user?.username}</p>
      {!restaurantId ? (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem' }}>
          ⚠️ You haven't set up your restaurant yet. Go to <strong>Restaurant</strong> to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <StatCard label="Tables"         value={stats.tables}        color="#4299e1" />
          <StatCard label="Pending Orders" value={stats.pendingOrders} color="#ed8936" />
          <StatCard label="Total Bills"    value={stats.totalBills}    color="#48bb78" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
