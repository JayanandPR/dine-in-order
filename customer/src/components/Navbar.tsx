import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
  restaurantName?: string;
  cartCount?: number;
  onCartClick?: () => void;
}

const Navbar = ({ restaurantName, cartCount = 0, onCartClick }: Props) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get('table');
  const restaurantId = params.get('restaurant');
  const query = `?table=${tableId}&restaurant=${restaurantId}`;

  return (
    <div style={{ background: '#2d3748', color: '#fff', padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{restaurantName || 'Menu'}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={() => navigate(`/orders${query}`)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
          My Orders
        </button>
        {onCartClick && (
          <button onClick={onCartClick}
            style={{ background: cartCount > 0 ? '#e53e3e' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: cartCount > 0 ? 600 : 400 }}>
            🛒 {cartCount > 0 ? cartCount : ''}
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;