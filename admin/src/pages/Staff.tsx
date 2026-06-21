import { useEffect, useState } from 'react';
import api from '../api';

interface StaffMember { _id: string; username: string; email: string; }

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '0.75rem' };

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = () => api.get('/staff').then(r => setStaff(r.data.data)).catch(() => {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff', form);
      setForm({ username: '', email: '', password: '' });
      setMsg('Staff member added');
      loadStaff();
    } catch (err: any) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    await api.delete(`/staff/${id}`);
    loadStaff();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Staff Management</h1>
      {msg && <div style={{ background: '#f0fff4', border: '1px solid #48bb78', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: '#276749' }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0 }}>Add Staff</h3>
          <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Name" value={form.username} onChange={handleChange} style={inputStyle} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={inputStyle} required />
            <input name="password" type="password" placeholder="Password (min 8)" value={form.password} onChange={handleChange} style={inputStyle} required minLength={8} />
            <button type="submit" style={{ padding: '0.6rem 1.5rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              Create Account
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0 }}>Staff Members ({staff.length})</h3>
          {staff.length === 0 ? <p style={{ color: '#718096' }}>No staff added yet.</p> : staff.map(s => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f7fafc' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{s.username}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>{s.email}</div>
              </div>
              <button onClick={() => handleDelete(s._id)} style={{ padding: '0.35rem 0.75rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Staff;
