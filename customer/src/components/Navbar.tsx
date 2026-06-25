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
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
      <div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{restaurantName || 'Menu'}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button onClick={() => navigate(`/orders${query}`)}
          style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
          My Orders
        </button>
        {onCartClick && (
          <button onClick={onCartClick}
            style={{ background: cartCount > 0 ? 'var(--brand)' : 'var(--surface-2)', color: cartCount > 0 ? '#fff' : 'var(--text-2)', border: cartCount > 0 ? 'none' : '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}>
            🛒 {cartCount > 0 ? cartCount : ''}
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;