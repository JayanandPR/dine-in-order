import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'admin',
      });
      // Auto login after register
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '0.25rem', fontSize: '1.4rem' }}>Create Admin Account</h1>
        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Dine-In-Order management</p>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px', padding: '0.6rem 0.9rem', marginBottom: '1rem', color: '#c53030', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>Name</label>
            <input name="username" value={form.username} onChange={handleChange}
              placeholder="Your name" style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="admin@example.com" style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Min 8 characters" style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
              placeholder="Repeat password" style={inputStyle} required />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.7rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#718096' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2d3748', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;