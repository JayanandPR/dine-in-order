import { useEffect, useState } from 'react';
import api from '../api';

interface Summary { totalRevenue: number; totalOrders: number; averageRating: number; }
interface DailyRevenue { _id: string; revenue: number; count: number; }
interface PopularItem { _id: string; totalQty: number; revenue: number; }
interface OrderStatus { _id: string; count: number; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed8936', preparing: '#4299e1', ready: '#48bb78', served: '#718096', cancelled: '#e53e3e',
};

const Analytics = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(({ data }) => {
      setSummary(data.data.summary);
      setDailyRevenue(data.data.dailyRevenue);
      setPopularItems(data.data.popularItems);
      setOrdersByStatus(data.data.ordersByStatus);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#718096' }}>Loading analytics...</p>;
  if (!summary) return <p>Set up your restaurant first.</p>;

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Analytics</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue', value: `₹${summary.totalRevenue.toFixed(2)}`, color: '#48bb78' },
          { label: 'Total Orders',  value: summary.totalOrders, color: '#4299e1' },
          { label: 'Avg Rating',    value: `${summary.averageRating} ⭐`, color: '#ed8936' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Daily revenue bar chart */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Revenue — Last 7 Days</h3>
          {dailyRevenue.length === 0 ? <p style={{ color: '#718096' }}>No data yet.</p> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px' }}>
              {dailyRevenue.map(d => (
                <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#718096' }}>₹{d.revenue.toFixed(0)}</span>
                  <div style={{ width: '100%', background: '#4299e1', borderRadius: '4px 4px 0 0', height: `${(d.revenue / maxRevenue) * 120}px`, minHeight: '4px' }} />
                  <span style={{ fontSize: '0.65rem', color: '#a0aec0', transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}>{d._id.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Orders by Status</h3>
          {ordersByStatus.map(s => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f7fafc' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[s._id] || '#718096', display: 'inline-block' }} />
                <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{s._id}</span>
              </span>
              <span style={{ fontWeight: 600 }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular items */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Top 5 Items</h3>
        {popularItems.length === 0 ? <p style={{ color: '#718096' }}>No orders yet.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['Item', 'Qty Sold', 'Revenue'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {popularItems.map((item, i) => (
                <tr key={item._id} style={{ borderTop: '1px solid #f7fafc' }}>
                  <td style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#ebf8ff', color: '#2b6cb0', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                    {item._id}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>{item.totalQty}</td>
                  <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#276749' }}>₹{item.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Analytics;