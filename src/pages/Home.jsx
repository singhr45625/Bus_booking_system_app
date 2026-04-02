import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, CalendarDays, Bus as BusIcon, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [buses, setBuses] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchBuses = async () => {
    const trimmedSource = source.trim();
    const trimmedDest = destination.trim();

    if (!trimmedSource || !trimmedDest) {
      alert('Please enter Source and Destination');
      return;
    }
    const params = new URLSearchParams();
    params.append('source', trimmedSource);
    params.append('destination', trimmedDest);
    
    // Ensure date is correctly handled
    if (date) {
      params.append('date', date);
    } else {
      params.append('date', 'Any Date');
    }
    
    navigate(`/search?${params.toString()}`);
  };


  // Remove the useEffect that triggers on mount to avoid the alert
  // when source and destination are empty.
  // useEffect(() => {
  //   fetchBuses();
  // }, []);

  const handleBook = (busId) => {
    if (!user) {
      alert('Please login to book a ticket');
      navigate('/login');
      return;
    }
    
    if (user.role === 'operator' || user.role === 'admin') {
      alert('Operators and Admins cannot book tickets. Please use a customer account.');
      return;
    }

    navigate(`/booking/${busId}`);
  };


  const swapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade">
          <h1>India's No. 1 Online Bus Ticket Booking Site</h1>
          
          <div className="search-box-container">
            <div className="search-box glass-effect">
              <div className="input-group">
                <div className="input-field">
                  <div className="input-icon">
                    <BusIcon size={20} />
                  </div>
                  <div className="input-wrapper">
                    <label>From</label>
                    <input 
                      type="text" 
                      value={source} 
                      onChange={(e) => setSource(e.target.value)} 
                      placeholder="Source City" 
                    />
                  </div>
                </div>

                <button className="swap-btn" onClick={swapLocations}>
                  <ArrowRight size={18} />
                </button>

                <div className="input-field">
                  <div className="input-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="input-wrapper">
                    <label>To</label>
                    <input 
                      type="text" 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)} 
                      placeholder="Destination City" 
                    />
                  </div>
                </div>

                <div className="input-field date-field">
                  <div className="input-icon">
                    <CalendarDays size={20} />
                  </div>
                  <div className="input-wrapper">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                    />
                  </div>
                </div>

                <button className="search-btn" onClick={fetchBuses} disabled={isSearching}>
                  {isSearching ? 'SEARCHING...' : 'SEARCH BUSES'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers-section dash-container animate-fade" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>TRENDING OFFERS</h2>
          <button className="view-all">View All</button>
        </div>
        <div className="offers-grid">
          <div className="offer-card purple">
            <div className="offer-tag">BUS250</div>
            <h3>Save up to Rs 250</h3>
            <p>Valid till 31 Apr 2026</p>
          </div>
          <div className="offer-card red">
            <div className="offer-tag">FIRSTBUS</div>
            <h3>20% Cashback</h3>
            <p>On your first booking</p>
          </div>
          <div className="offer-card green">
            <div className="offer-tag">STEALDEAL</div>
            <h3>Flat Rs 500 Off</h3>
            <p>For registered users</p>
          </div>
        </div>
      </section>

      {/* Bus Listing Section */}
      <section className="listing-section dash-container animate-fade" style={{ animationDelay: '0.4s' }}>
        {buses.length > 0 && (
          <div className="listing-header">
            <h2>{buses.length} Buses found</h2>
            <div className="filters-short">
              <span>Sort by:</span>
              <button className="active">Ratings</button>
              <button>Cheapest</button>
            </div>
          </div>
        )}
        
        <div className="bus-cards-container">
          {buses.map(bus => (
            <div key={bus._id} className="bus-card animate-slide">
              <div className="bus-info-main">
                <div className="operator-info">
                  <h3>{bus.name}</h3>
                  <span className="bus-type-badge">{bus.type || 'Non-AC Seater'}</span>
                </div>
                
                <div className="journey-details">
                  <div className="time-point">
                    <span className="time">{bus.departureTime}</span>
                    <span className="place">{bus.source}</span>
                  </div>
                  
                  <div className="duration-line-container">
                    <span className="duration">6h 30m</span>
                    <div className="line"></div>
                  </div>
                  
                  <div className="time-point">
                    <span className="time">{bus.arrivalTime}</span>
                    <span className="place">{bus.destination}</span>
                  </div>
                </div>

                <div className="extra-info">
                  <div className="rating">
                    <span className="stars">★ 4.5</span>
                    <span className="count">120 Ratings</span>
                  </div>
                  <div className="amenities">
                    {bus.amenities?.slice(0, 3).map((a, i) => (
                      <span key={i} className="amenity-chip">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bus-info-side">
                <div className="price-container">
                  <span className="label">Starts from</span>
                  <div className="price">
                    <span className="curr">INR</span>
                    <span className="amt">{bus.price}</span>
                  </div>
                </div>
                
                <div className="availability">
                  <span className="seats">{bus.totalSeats - (bus.bookedSeats?.length || 0)}</span>
                  <span className="text">Seats available</span>
                </div>

                <button 
                  className={`view-seats-btn ${user?.role === 'operator' || user?.role === 'admin' ? 'disabled-btn' : ''}`} 
                  onClick={() => handleBook(bus._id)}
                  disabled={user?.role === 'operator' || user?.role === 'admin'}
                >
                  {user?.role === 'operator' || user?.role === 'admin' ? 'READ ONLY' : 'VIEW SEATS'}
                </button>
              </div>
            </div>
          ))}
          
          {buses.length === 0 && !isSearching && (
            <div className="no-buses">
              <BusIcon size={80} />
              <h3>No buses found for this route</h3>
              <p>Try changing the dates or cities</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};


export default Home;
