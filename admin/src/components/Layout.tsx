import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',  label: '📊 Dashboard'  },
  { to: '/restaurant', label: '🏠 Restaurant'  },
  { to: '/menu',       label: '🍽️ Menu'        },
  { to: '/tables',     label: '🪑 Tables'      },
  { to: '/staff',      label: '👥 Staff'       },
  { to: '/orders',     label: '📋 Orders'      },
  { to: '/bills',      label: '🧾 Bills'       },
  { to: '/analytics',  label: '📈 Analytics'   },
  { to: '/ratings',    label: '⭐ Ratings'     },
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
      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#1a202c', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #2d3748' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>🍴 Dine-In-Order</div>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>{user?.username}</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'block', padding: '0.6rem 1.5rem', color: isActive ? '#fff' : '#a0aec0',
                background: isActive ? '#2d3748' : 'transparent', textDecoration: 'none', fontSize: '0.9rem',
              })}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #2d3748' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '0.5rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Logout
          </button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, background: '#f7fafc', padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
