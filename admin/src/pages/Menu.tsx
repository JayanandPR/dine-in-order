import { useEffect, useState } from 'react';
import api from '../api';

interface Category { _id: string; name: string; }
interface FoodItem { _id: string; name: string; price: number; description: string; dietType: string; availability: boolean; stock: number; image?: string; categoryId: { _id: string; name: string } | string; }

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' };
const btnStyle = (color: string): React.CSSProperties => ({ padding: '0.4rem 0.9rem', background: color, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' });

const EMPTY_ITEM = { name: '', price: 0, description: '', dietType: 'veg', stock: 10, availability: true, categoryId: '' };

const Menu = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [newCat, setNewCat] = useState('');
  const [itemForm, setItemForm] = useState<any>(EMPTY_ITEM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
  const [msg, setMsg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (rid) {
        setRestaurantId(rid);
        loadData(rid);
      }
    });
  }, []);

  const loadData = (rid: string) => {
    api.get(`/menu/${rid}/categories`).then(r => setCategories(r.data.data));
    api.get(`/menu/${rid}/items`).then(r => setItems(r.data.data));
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    await api.post('/menu/categories', { name: newCat });
    setNewCat('');
    loadData(restaurantId);
    setMsg('Category added');
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete category and all its items?')) return;
    await api.delete(`/menu/categories/${id}`);
    loadData(restaurantId);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setItemForm((p: any) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value }));
  };

  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = itemForm.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      imageUrl = data.data.url;
    }

    const payload = { ...itemForm, image: imageUrl };

    if (editingId) {
      await api.put(`/menu/items/${editingId}`, payload);
      setMsg('Item updated');
    } else {
      await api.post('/menu/items', payload);
      setMsg('Item added');
    }
    setItemForm(EMPTY_ITEM);
    setImageFile(null);
    setEditingId(null);
    loadData(restaurantId);
  };

  const startEdit = (item: FoodItem) => {
    setEditingId(item._id);
    setItemForm({ ...item, categoryId: typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId });
    setActiveTab('items');
    window.scrollTo(0, 0);
  };

  const deleteItem = async (id: string) => {
    await api.delete(`/menu/items/${id}`);
    loadData(restaurantId);
  };

  const dietColor = (d: string) => d === 'veg' ? '#48bb78' : d === 'vegan' ? '#38b2ac' : '#e53e3e';

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Menu Management</h1>
      {msg && <div style={{ background: '#f0fff4', border: '1px solid #48bb78', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: '#276749' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['items', 'categories'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, background: activeTab === t ? '#2d3748' : '#e2e8f0', color: activeTab === t ? '#fff' : '#4a5568' }}>
            {t === 'items' ? '🍽️ Items' : '📂 Categories'}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addCategory} style={btnStyle('#4299e1')}>Add</button>
          </div>
          {categories.map(c => (
            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f7fafc' }}>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <button onClick={() => deleteCategory(c._id)} style={btnStyle('#e53e3e')}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'items' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={submitItem}>
              {[['name','Name','text'],['price','Price','number'],['stock','Stock','number']].map(([n,l,t]) => (
                <div key={n} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>{l}</label>
                  <input type={t} name={n} value={itemForm[n]} onChange={handleItemChange} style={inputStyle} required />
                </div>
              ))}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Category</label>
                <select name="categoryId" value={itemForm.categoryId} onChange={handleItemChange} style={inputStyle} required>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Diet Type</label>
                <select name="dietType" value={itemForm.dietType} onChange={handleItemChange} style={inputStyle}>
                  {['veg','non-veg','vegan'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Description</label>
                <textarea name="description" value={itemForm.description} onChange={handleItemChange}
                  style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '0.875rem' }} />
                {itemForm.image && <img src={itemForm.image} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' }} />}
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" style={btnStyle('#2d3748')}>{editingId ? 'Update' : 'Add Item'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setItemForm(EMPTY_ITEM); }} style={btnStyle('#718096')}>Cancel</button>}
              </div>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Items ({items.length})</h3>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f7fafc' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dietColor(item.dietType), display: 'inline-block' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    {!item.availability && <span style={{ fontSize: '0.75rem', background: '#fed7d7', color: '#c53030', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Unavailable</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>₹{item.price} · Stock: {item.stock}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startEdit(item)} style={btnStyle('#4299e1')}>Edit</button>
                  <button onClick={() => deleteItem(item._id)} style={btnStyle('#e53e3e')}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
