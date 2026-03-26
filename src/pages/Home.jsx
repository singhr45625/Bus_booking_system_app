import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, CalendarDays, Bus as BusIcon, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [buses, setBuses] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seatSelections, setSeatSelections] = useState({});
  const { user } = useContext(AuthContext);

  const fetchBuses = async () => {
    let url = '/api/buses';
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;
    const { data } = await axios.get(url);
    setBuses(data);
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleBook = async (busId) => {
    if (!user) {
      alert('Please login to book a ticket');
      return;
    }
    const seatsStr = seatSelections[busId] || '';
    const seatNumbers = seatsStr.split(',').map(s => s.trim()).filter(s => s);
    if (seatNumbers.length === 0) {
      alert('Please enter seat numbers to book (e.g., A1, A2)');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/bookings', { busId, seatNumbers }, config);
      alert('Booking Successful!');
      setSeatSelections({ ...seatSelections, [busId]: '' });
      fetchBuses();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="home-container">
      {/* RedBus Hero Section */}
      <section className="rb-hero">
        <h1 className="rb-hero-title">India's No. 1 Online Bus Ticket Booking Site</h1>
        
        {/* Horizontal Search Widget */}
        <div className="rb-search-widget">
          <div className="rb-input-col">
            <span className="rb-input-icon"><BusIcon size={20} color="#d84e55"/></span>
            <div className="rb-input-wrapper">
              <label>From</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Enter Source" />
            </div>
          </div>
          <div className="rb-input-col">
            <span className="rb-input-icon"><MapPin size={20} color="#d84e55"/></span>
            <div className="rb-input-wrapper">
              <label>To</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter Destination" />
            </div>
          </div>
          <div className="rb-input-col">
            <span className="rb-input-icon"><CalendarDays size={20} color="#d84e55"/></span>
            <div className="rb-input-wrapper">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <button className="rb-search-btn" onClick={fetchBuses}>
            SEARCH BUSES
          </button>
        </div>
      </section>

      {/* Offers Section */}
      <section className="rb-offers-section">
        <div className="rb-offers-header">
          <h2>TRENDING OFFERS</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="rb-offers-scroll">
          <div className="rb-offer-card" style={{backgroundImage: 'linear-gradient(to right, #2E3192, #1BFFFF)'}}>
            <div className="offer-content">
              <span>Save up to Rs 250 on bus tickets</span>
              <strong>Valid till 31 Mar</strong>
            </div>
          </div>
          <div className="rb-offer-card" style={{backgroundImage: 'linear-gradient(to right, #D4145A, #FBB03B)'}}>
            <div className="offer-content">
              <span>20% Cashback on first booking</span>
              <strong>Use code: FIRSTBUS</strong>
            </div>
          </div>
          <div className="rb-offer-card" style={{backgroundImage: 'linear-gradient(to right, #009245, #FCEE21)'}}>
            <div className="offer-content">
              <span>Rs 500 off for registered users</span>
              <strong>Limited time offer</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Bus Listing Section */}
      <section className="rb-listing-section">
        {buses.length > 0 && <h2 className="rb-results-title">{buses.length} Buses found</h2>}
        
        <div className="rb-bus-list">
          {buses.map(bus => (
            <div key={bus._id} className="rb-bus-card">
              <div className="rb-bus-details-left">
                <div className="bus-name-row">
                  <h3>{bus.name}</h3>
                  <span className="bus-type">{bus.type || 'Non-AC'}</span>
                </div>
                <div className="bus-amenities">
                  {bus.amenities?.length > 0 ? bus.amenities.join(' • ') : 'Standard Amenities'}
                </div>
                <div className="bus-timing-row">
                  <div className="time-block">
                    <strong>{bus.departureTime}</strong>
                    <span className="time-loc">{bus.source}</span>
                  </div>
                  <div className="time-duration">
                    <span className="duration-line"></span>
                  </div>
                  <div className="time-block">
                    <strong>{bus.arrivalTime}</strong>
                    <span className="time-loc">{bus.destination}</span>
                  </div>
                </div>
              </div>
              
              <div className="rb-bus-details-right">
                <div className="price-tag">
                  <span className="currency">INR</span>
                  <span className="amount">{bus.price}</span>
                </div>
                <div className="seat-availability">
                  <strong>{bus.totalSeats - (bus.bookedSeats?.length || 0)}</strong> Seats Available
                </div>
                <div className="booking-action">
                  <input 
                    type="text" 
                    placeholder="Enter Seats (A1, A2)" 
                    value={seatSelections[bus._id] || ''} 
                    onChange={(e) => setSeatSelections({ ...seatSelections, [bus._id]: e.target.value })}
                    className="seat-input"
                  />
                  <button className="view-seats-btn" onClick={() => handleBook(bus._id)}>
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>
          ))}
          {buses.length === 0 && (
            <div className="empty-state">
              <BusIcon size={64} color="#d84e55" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h2>Oops! No buses found.</h2>
              <p>Try searching for different routes or dates.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
