import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bus as BusIcon, Filter, Clock, Star, ArrowRight, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import './Home.css'; // Reusing Home.css for common styles

const BusSearchResults = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const query = new URLSearchParams(search);
  
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    type: [], // AC, Non-AC
    departureTime: [], // Morning, Afternoon, Evening, Night
    priceRange: [0, 10000]
  });

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(search);
      
      // Add filters to query params
      if (filters.type.length > 0) params.set('type', filters.type.join(','));
      if (filters.departureTime.length > 0) params.set('departureTime', filters.departureTime.join(','));
      
      params.set('minPrice', filters.priceRange[0]);
      params.set('maxPrice', filters.priceRange[1]);
      
      const { data } = await axios.get(`/api/buses?${params.toString()}`);
      setBuses(data);
      setFilteredBuses(data);
    } catch (err) {
      console.error('Fetch Buses Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [search, filters.type, filters.departureTime, filters.priceRange]);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      }
      return { ...prev, [category]: [...current, value] };
    });
  };

  const handleSelectBus = (busId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'operator' || user.role === 'admin') {
      alert('Operators and Admins cannot book tickets. Please use a customer account.');
      return;
    }
    navigate(`/booking/${busId}`);
  };



  return (
    <div className="search-results-page animate-fade">
      {/* Search Result Header */}
      <div className="results-top-bar glass-effect">
        <div className="nav-container">
          <div className="search-info">
            <span className="route">{query.get('source')} <ArrowRight size={16} /> {query.get('destination')}</span>
            <span className="date">| {query.get('date') || 'Any Date'}</span>
          </div>
          <button className="modify-search-btn" onClick={() => navigate('/')}>MODIFY</button>
        </div>
      </div>

      <div className="results-content nav-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3><Filter size={18} /> FILTERS</h3>
            <button onClick={() => setFilters({ type: [], departureTime: [], priceRange: [0, 10000] })}>Reset</button>
          </div>

          <div className="filter-group">
            <h4>BUS TYPE</h4>
            <label className="checkbox-item">
              <input type="checkbox" checked={filters.type.includes('AC Seater')} onChange={() => toggleFilter('type', 'AC Seater')} />
              <span>AC Seater</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={filters.type.includes('AC Sleeper')} onChange={() => toggleFilter('type', 'AC Sleeper')} />
              <span>AC Sleeper</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={filters.type.includes('Non-AC Seater')} onChange={() => toggleFilter('type', 'Non-AC Seater')} />
              <span>Non-AC Seater</span>
            </label>
          </div>

          <div className="filter-group">
            <h4>PRICE RANGE</h4>
            <div className="price-slider-info" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem' }}>₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              value={filters.priceRange[1]} 
              onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div className="filter-group">
            <h4>DEPARTURE TIME</h4>
            <label className="checkbox-item">
              <input type="checkbox" checked={filters.departureTime.includes('Morning')} onChange={() => toggleFilter('departureTime', 'Morning')} />
              <span>Before 6 AM</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={filters.departureTime.includes('Afternoon')} onChange={() => toggleFilter('departureTime', 'Afternoon')} />
              <span>6 AM - 12 PM</span>
            </label>
          </div>
        </aside>

        {/* Main Listing Area */}
        <main className="results-listing">
          <div className="listing-stats">
            <h2>{filteredBuses.length} Buses Found</h2>
            <div className="sort-options">
              <span>Sort by:</span>
              <button className="active">Ratings</button>
              <button>Price</button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching best buses for you...</p>
            </div>
          ) : (
            <div className="bus-cards-stack">
              {filteredBuses.map(bus => (
                <div key={bus._id} className="bus-card-expanded animate-slide">
                  <div className="card-top">
                    <div className="operator-details">
                      <h3>{bus.name}</h3>
                      <div className="badges">
                        <span className="type-badge">{bus.type}</span>
                        <span className="primo-badge"><ShieldCheck size={14} /> Primo</span>
                      </div>
                    </div>
                    
                    <div className="timing-row">
                      <div className="time-col">
                        <span className="time">{bus.departureTime}</span>
                        <span className="location">{bus.source}</span>
                      </div>
                      <div className="duration-col">
                        <span className="dur">06h 45m</span>
                        <div className="path"></div>
                      </div>
                      <div className="time-col">
                        <span className="time">{bus.arrivalTime}</span>
                        <span className="location">{bus.destination}</span>
                      </div>
                    </div>

                    <div className="rating-col">
                      <div className="star-rating">
                        <Star size={14} fill="white" /> 4.4
                      </div>
                      <span className="count">1.2k Ratings</span>
                    </div>

                    <div className="price-col">
                      <span className="label">Starts from</span>
                      <span className="price">INR {bus.price}</span>
                      <span className="offer">Save ₹50</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div className="amenities-row">
                      <span>Live Tracking</span>
                      <span>Water Bottle</span>
                      <span>Blankets</span>
                    </div>
                    <div className="actions">
                      <span className="seats-left">{bus.totalSeats - (bus.bookedSeats?.length || 0)} Seats available</span>
                      <button 
                        className={`view-seats-btn ${user?.role === 'operator' || user?.role === 'admin' ? 'disabled-btn' : ''}`} 
                        onClick={() => handleSelectBus(bus._id)}
                        disabled={user?.role === 'operator' || user?.role === 'admin'}
                      >
                        {user?.role === 'operator' || user?.role === 'admin' ? 'READ ONLY' : 'VIEW SEATS'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBuses.length === 0 && (
                <div className="empty-results">
                  <BusIcon size={60} />
                  <h3>No buses match your filters</h3>
                  <p>Try resetting some filters to see more results</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .search-results-page {
          background: #f7f9fb;
          min-height: 100vh;
        }
        .results-top-bar {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 2rem;
          position: sticky;
          top: 72px;
          z-index: 100;
        }
        .search-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .search-info .route {
          font-weight: 800;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modify-search-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.4rem 1.2rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .results-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          padding-bottom: 4rem;
        }
        .filters-sidebar {
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          height: fit-content;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.8rem;
        }
        .sidebar-header h3 { font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .sidebar-header button { background: none; border: none; color: #106fba; font-size: 0.8rem; cursor: pointer; }
        
        .filter-group { margin-bottom: 2rem; }
        .filter-group h4 { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
        .checkbox-item { display: flex; align-items: center; gap: 10px; margin-bottom: 0.8rem; cursor: pointer; font-size: 0.9rem; }
        
        .listing-stats { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .sort-options { display: flex; align-items: center; gap: 15px; font-size: 0.9rem; }
        .sort-options button { background: white; border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 4px; cursor: pointer; }
        .sort-options button.active { background: var(--secondary); color: white; }

        .bus-card-expanded {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }
        .bus-card-expanded:hover { box-shadow: var(--shadow-md); border-color: #d1d1d1; }
        
        .card-top { display: grid; grid-template-columns: 1.2fr 1.5fr 0.8fr 1fr; gap: 1rem; padding: 1.5rem; }
        .operator-details h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .badges { display: flex; gap: 8px; }
        .type-badge { font-size: 0.7rem; background: #f1f3f5; padding: 2px 6px; border-radius: 4px; }
        .primo-badge { font-size: 0.7rem; background: #fff3f3; color: var(--primary); padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; font-weight: 700; }

        .timing-row { display: flex; align-items: center; justify-content: center; }
        .time-col { display: flex; flex-direction: column; text-align: center; }
        .time-col .time { font-size: 1.1rem; font-weight: 800; }
        .time-col .location { font-size: 0.8rem; color: var(--text-muted); }
        .duration-col { width: 80px; text-align: center; padding: 0 10px; }
        .duration-col .dur { font-size: 0.7rem; color: var(--text-muted); }
        .duration-col .path { height: 1px; background: #ddd; margin-top: 4px; position: relative; }
        .duration-col .path::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--primary); position: absolute; right: 0; top: -3px; }

        .rating-col { display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
        .star-rating { background: var(--accent); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; }

        .price-col { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; }
        .price-col .price { font-size: 1.4rem; font-weight: 800; color: var(--secondary); }
        .price-col .offer { font-size: 0.75rem; color: var(--accent); font-weight: 700; }

        .card-bottom { background: #fbfbfb; border-top: 1px solid #f0f0f0; padding: 10px 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .amenities-row { display: flex; gap: 15px; font-size: 0.8rem; color: #666; }
        .actions { display: flex; align-items: center; gap: 20px; }
        .seats-left { font-size: 0.85rem; color: #d84e55; font-weight: 600; }
        
        .loading-state { text-align: center; padding: 5rem 0; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BusSearchResults;
