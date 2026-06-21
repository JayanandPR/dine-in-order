import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import api from '../api';

const Profile = () => {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api.patch('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setMsg('Password updated successfully');
      setCurrentPw('');
      setNewPw('');
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error updating password');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box',
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Account info */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0 }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Name',  value: user?.username },
              { label: 'Email', value: user?.email },
              { label: 'Role',  value: user?.role },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Change password */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginTop: 0 }}>Change Password</h3>
          {msg && (
            <div style={{ padding: '0.6rem 0.9rem', background: msg.includes('success') ? '#f0fff4' : '#fff5f5', border: `1px solid ${msg.includes('success') ? '#9ae6b4' : '#fc8181'}`, borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', color: msg.includes('success') ? '#276749' : '#c53030' }}>
              {msg}
            </div>
          )}
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} required minLength={8} />
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: '0.6rem 1.5rem', background: '#1a4731', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;