import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ticket } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/bookings/my-bookings', config);
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No bookings found.</p>
      ) : (
        bookings.map(b => (
          <div key={b._id} className="booking-item">
            <div>
              <h3>{b.bus.name}</h3>
              <p>{b.bus.source} to {b.bus.destination}</p>
              <small style={{ color: 'var(--text-muted)' }}>{b.bus.departureTime} | {new Date(b.createdAt).toLocaleDateString()}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Ticket size={18} /> {b.seatNumbers?.join(', ') || b.seats} Seat(s)
              </div>
              <span>${b.totalPrice}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
