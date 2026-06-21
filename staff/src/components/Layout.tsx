import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/orders',  label: '📋 Live Orders' },
  { to: '/history', label: '🕐 Order History' },
  { to: '/tables',  label: '🪑 Tables' },
  { to: '/profile', label: '👤 Profile' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '210px', background: '#1a4731', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #276749' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>🍴 Dine-In-Order</div>
          <div style={{ fontSize: '0.8rem', color: '#9ae6b4', marginTop: '0.25rem' }}>Staff Portal</div>
          <div style={{ fontSize: '0.8rem', color: '#68d391', marginTop: '0.25rem' }}>{user?.username}</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'block', padding: '0.65rem 1.5rem',
                color: isActive ? '#fff' : '#9ae6b4',
                background: isActive ? '#276749' : 'transparent',
                textDecoration: 'none', fontSize: '0.9rem',
              })}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #276749' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '0.5rem', background: '#c53030', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, background: '#f0fdf4', padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;