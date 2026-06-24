import { useEffect, useState } from 'react';
import api from '../api';

interface Bill {
  _id: string;
  tableId: { tableNo: number };
  totalPayableAmount: number;
  isPaid: boolean;
  paymentId?: string;
  generatedAt: string;
}

type FilterType = 'all' | 'today' | 'week' | 'month' | 'year';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today',    value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

const filterBills = (bills: Bill[], filter: FilterType): Bill[] => {
  if (filter === 'all') return bills;
  const now = new Date();
  const start = new Date();

  if (filter === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return bills.filter(b => new Date(b.generatedAt) >= start);
};

const Bills = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) {
        setRestaurantId(rid);
        api.get(`/bills/restaurant/${rid}`).then(r => setBills(r.data.data));
      }
    });
  }, []);

  const filtered = filterBills(bills, filter);
  const revenue = filtered.filter(b => b.isPaid).reduce((s, b) => s + b.totalPayableAmount, 0);
  const paidCount = filtered.filter(b => b.isPaid).length;
  const unpaidCount = filtered.filter(b => !b.isPaid).length;

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Bills</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: '0.4rem 1rem', border: 'none', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: filter === f.value ? 600 : 400,
              background: filter === f.value ? '#2d3748' : '#e2e8f0',
              color: filter === f.value ? '#fff' : '#4a5568',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #48bb78' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#276749' }}>₹{revenue.toFixed(2)}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>Total Revenue</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #4299e1' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2b6cb0' }}>{filtered.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>Total Bills</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #48bb78' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#276749' }}>{paidCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>Paid</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #e53e3e' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c53030' }}>{unpaidCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>Unpaid</div>
        </div>
      </div>

      {/* Bills table */}
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
            {filtered.map(b => (
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
        {filtered.length === 0 && (
          <p style={{ padding: '1.5rem', color: '#718096', textAlign: 'center' }}>
            No bills found for this period.
          </p>
        )}
      </div>
    </div>
  );
};

export default Bills;