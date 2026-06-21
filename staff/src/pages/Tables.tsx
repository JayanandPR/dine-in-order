import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useWebSocket } from '../hooks/useWebSocket';

interface Table { _id: string; tableNo: number; tableCapacity: number; status: string; }

const STATUS_COLORS: Record<string, string> = {
  available: '#48bb78', occupied: '#e53e3e', reserved: '#ed8936',
};

const Tables = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.user?.restaurantId;
      if (rid) {
        setRestaurantId(rid);
        api.get(`/tables/${rid}`).then(r => setTables(r.data.data));
      }
    });
  }, []);

  const handleWsMessage = useCallback((msg: any) => {
    if (msg.event === 'table:status_update') {
      setTables(prev => prev.map(t =>
        t._id === msg.payload.tableId ? { ...t, status: msg.payload.status } : t
      ));
    }
  }, []);

  useWebSocket(restaurantId, handleWsMessage);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/tables/${id}/status`, { status });
    setTables(prev => prev.map(t => t._id === id ? { ...t, status } : t));
  };

  const counts = {
    available: tables.filter(t => t.status === 'available').length,
    occupied:  tables.filter(t => t.status === 'occupied').length,
    reserved:  tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Tables</h1>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{ background: '#fff', borderRadius: '8px', padding: '0.75rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[status], display: 'inline-block' }} />
            <span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: '#4a5568' }}>{status}</span>
            <span style={{ fontWeight: 700, color: STATUS_COLORS[status] }}>{count}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
        {tables.map(t => (
          <div key={t._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `4px solid ${STATUS_COLORS[t.status]}` }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.2rem' }}>Table {t.tableNo}</div>
            <div style={{ fontSize: '0.825rem', color: '#718096', marginBottom: '0.75rem' }}>Capacity: {t.tableCapacity}</div>
            <span style={{ background: STATUS_COLORS[t.status], color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', display: 'inline-block', marginBottom: '0.75rem', textTransform: 'capitalize' }}>
              {t.status}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(['available', 'occupied', 'reserved'] as const).filter(s => s !== t.status).map(s => (
                <button key={s} onClick={() => updateStatus(t._id, s)}
                  style={{ padding: '0.35rem', background: STATUS_COLORS[s] + '22', color: STATUS_COLORS[s], border: `1px solid ${STATUS_COLORS[s]}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 500 }}>
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;