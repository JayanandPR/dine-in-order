import { useEffect, useState, FormEvent } from 'react';
import api from '../api';

const DIET_TYPES = ['veg', 'non-veg', 'both'];
const CUISINE_TYPES = ['indian', 'chinese', 'italian', 'continental', 'multi'];

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.875rem', color: '#4a5568' };

const Restaurant = () => {
  const [form, setForm] = useState({ name: '', address: '', contactNumber: '', contactEmail: '', opensAt: '09:00', closesAt: '22:00', dietType: 'both', cuisineType: 'multi' });
  const [exists, setExists] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    api.get('/restaurants/mine').then(({ data }) => {
      if (data.data) {
        setForm(data.data);
        setExists(true);
        if (data.data.generalQrCode) setQrCode(data.data.generalQrCode);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      exists ? await api.put('/restaurants/mine', form) : await api.post('/restaurants', form);
      setMsg(exists ? 'Restaurant updated!' : 'Restaurant created!');
      setExists(true);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const generateQR = async () => {
    setQrLoading(true);
    try {
      const { data } = await api.post('/restaurants/mine/qr');
      setQrCode(data.data.qrCode);
      setMsg('General QR generated!');
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error generating QR');
    } finally { setQrLoading(false); }
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = 'restaurant-qr.png';
    a.click();
  };
  

  const field = (label: string, name: string, type = 'text') => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} name={name} value={(form as any)[name]} onChange={handleChange}
        style={inputStyle} required />
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>{exists ? 'Edit Restaurant' : 'Setup Restaurant'}</h1>
      {msg && <div style={{ padding: '0.75rem 1rem', background: msg.includes('!') ? '#f0fff4' : '#fff5f5', border: `1px solid ${msg.includes('!') ? '#48bb78' : '#fc8181'}`, borderRadius: '8px', marginBottom: '1rem', color: msg.includes('!') ? '#276749' : '#c53030' }}>{msg}</div>}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          {field('Restaurant Name', 'name')}
          {field('Address', 'address')}
          {field('Contact Number', 'contactNumber', 'tel')}
          {field('Contact Email', 'contactEmail', 'email')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Opens At</label>
              <input type="time" name="opensAt" value={form.opensAt} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Closes At</label>
              <input type="time" name="closesAt" value={form.closesAt} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Diet Type</label>
              <select name="dietType" value={form.dietType} onChange={handleChange} style={inputStyle}>
                {DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cuisine Type</label>
              <select name="cuisineType" value={form.cuisineType} onChange={handleChange} style={inputStyle}>
                {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ padding: '0.7rem 2rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? 'Saving...' : exists ? 'Update' : 'Create Restaurant'}
          </button>

          {exists && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>General QR Code</h3>
              <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1rem' }}>
                This QR takes customers to your menu homepage. Place it at the restaurant entrance or on tables without individual QR codes.
              </p>
              {qrCode ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <img src={qrCode} alt="General QR" style={{ width: '160px', height: '160px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={downloadQR}
                      style={{ padding: '0.5rem 1.25rem', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      ⬇ Download QR
                    </button>
                    <button onClick={generateQR} disabled={qrLoading}
                      style={{ padding: '0.5rem 1.25rem', background: '#718096', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={generateQR} disabled={qrLoading}
                  style={{ padding: '0.6rem 1.5rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                  {qrLoading ? 'Generating...' : '✨ Generate QR'}
                </button>
              )}
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Restaurant;
