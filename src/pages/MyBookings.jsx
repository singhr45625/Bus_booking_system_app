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
            <div key={b._id} className="booking-item animate-fade">
              <div className="booking-main-info">
                <h3>{b.bus?.name || 'Bus Service'}</h3>
                <p className="route-info">{b.bus?.source} ➔ {b.bus?.destination}</p>
                <div className="passenger-compact">
                  <strong>Passenger:</strong> {b.passengerDetails?.name || b.user?.username}
                  <span className="contact">({b.passengerDetails?.email})</span>
                </div>
                <small className="booking-date">Booked on: {new Date(b.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="booking-meta">
                <div className="seats-tag">
                  <Ticket size={16} /> {b.seatNumbers?.join(', ')}
                </div>
                <div className="price-tag">₹{b.totalPrice}</div>
                <span className={`status-badge ${b.status?.toLowerCase()}`}>{b.status}</span>
              </div>
            </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
