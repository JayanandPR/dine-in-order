import { useEffect, useState } from 'react';
import api from '../api';

interface Table { _id: string; tableNo: number; tableCapacity: number; status: string; qrCode?: string; }

const btnStyle = (color: string): React.CSSProperties => ({ padding: '0.4rem 0.9rem', background: color, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' });
const statusColor = (s: string) => s === 'available' ? '#48bb78' : s === 'occupied' ? '#e53e3e' : '#ed8936';

const Tables = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [tables, setTables] = useState<Table[]>([]);
  const [tableNo, setTableNo] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [qrModal, setQrModal] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) { setRestaurantId(rid); loadTables(rid); }
    });
  }, []);

  const loadTables = (rid: string) =>
    api.get(`/tables/${rid}`).then(r => setTables(r.data.data));

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tables', { tableNo: Number(tableNo), tableCapacity: Number(capacity) });
      setMsg('Table added');
      setTableNo('');
      loadTables(restaurantId);
    } catch (err: any) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Delete table?')) return;
    await api.delete(`/tables/${id}`);
    loadTables(restaurantId);
  };

  const downloadQR = (qrCode: string, tableNo: number) => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `table-${tableNo}-qr.png`;
    a.click();
  };

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Tables</h1>
      {msg && <div style={{ background: '#f0fff4', border: '1px solid #48bb78', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: '#276749' }}>{msg}</div>}

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0 }}>Add Table</h3>
        <form onSubmit={addTable} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input type="number" placeholder="Table No." value={tableNo} onChange={e => setTableNo(e.target.value)}
            style={{ width: '120px', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} required />
          <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)}
            style={{ width: '120px', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} required />
          <button type="submit" style={btnStyle('#2d3748')}>Add + Generate QR</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {tables.map(table => (
          <div key={table._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `4px solid ${statusColor(table.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Table {table.tableNo}</div>
              <span style={{ background: statusColor(table.status), color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>{table.status}</span>
            </div>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1rem' }}>Capacity: {table.tableCapacity}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {table.qrCode && (
                <>
                  <button onClick={() => setQrModal(table.qrCode!)} style={btnStyle('#4299e1')}>View QR</button>
                  <button onClick={() => downloadQR(table.qrCode!, table.tableNo)} style={btnStyle('#48bb78')}>↓ QR</button>
                </>
              )}
              <button onClick={() => deleteTable(table._id)} style={btnStyle('#e53e3e')}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {qrModal && (
        <div onClick={() => setQrModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Scan to order</p>
            <img src={qrModal} alt="QR code" style={{ width: '200px', height: '200px' }} />
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => setQrModal(null)} style={btnStyle('#718096')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
