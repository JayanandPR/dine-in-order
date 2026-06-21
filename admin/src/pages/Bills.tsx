import { useEffect, useState } from 'react';
import api from '../api';

interface Bill { _id: string; tableId: { tableNo: number }; totalPayableAmount: number; isPaid: boolean; paymentId?: string; generatedAt: string; }

const Bills = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) { setRestaurantId(rid); api.get(`/bills/restaurant/${rid}`).then(r => setBills(r.data.data)); }
    });
  }, []);

  const revenue = bills.filter(b => b.isPaid).reduce((s, b) => s + b.totalPayableAmount, 0);

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Bills</h1>
      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Total revenue: <strong style={{ color: '#276749' }}>₹{revenue.toFixed(2)}</strong></p>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              {['Table', 'Amount', 'Status', 'Payment ID', 'Generated'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b._id} style={{ borderTop: '1px solid #f7fafc' }}>
                <td style={{ padding: '0.75rem 1rem' }}>Table {b.tableId?.tableNo}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{b.totalPayableAmount.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ background: b.isPaid ? '#f0fff4' : '#fff5f5', color: b.isPaid ? '#276749' : '#c53030', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                    {b.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#718096' }}>{b.paymentId || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#718096' }}>{new Date(b.generatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && <p style={{ padding: '1.5rem', color: '#718096', textAlign: 'center' }}>No bills yet.</p>}
      </div>
    </div>
  );
};

export default Bills;
