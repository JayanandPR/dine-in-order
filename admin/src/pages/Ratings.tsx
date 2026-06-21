import { useEffect, useState } from 'react';
import api from '../api';

interface Rating { _id: string; rating: number; comment?: string; createdAt: string; }

const Ratings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const rid = data.data.restaurant?._id;
      if (!rid) return;
      setRestaurantId(rid);
      api.get(`/ratings/${rid}`).then(r => {
        const list = r.data.data;
        setRatings(list);
        if (list.length) setAvg(list.reduce((s: number, r: Rating) => s + r.rating, 0) / list.length);
      });
    });
  }, []);

  const stars = (n: number) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  if (!restaurantId) return <p>Set up your restaurant first.</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Ratings & Reviews</h1>
        {ratings.length > 0 && (
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: 600 }}>
            {avg.toFixed(1)} ⭐ ({ratings.length} reviews)
          </span>
        )}
      </div>

      {ratings.length === 0 ? (
        <p style={{ color: '#718096' }}>No ratings yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ratings.map(r => (
            <div key={r._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{stars(r.rating)}</span>
                <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p style={{ margin: 0, color: '#4a5568', fontSize: '0.9rem' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ratings;