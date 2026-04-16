import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Bus as BusIcon, Route as RouteIcon, MapPin, DollarSign, Calculator, Info, CheckCircle2 } from 'lucide-react';

const OperatorBuses = () => {
  const { user } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [busName, setBusName] = useState('');
  const [totalSeats, setTotalSeats] = useState(40);
  
  const [scheduleBusId, setScheduleBusId] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [price, setPrice] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [dynamicPricing, setDynamicPricing] = useState(false);
  
  // Fare & Stops Calculation State
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [previewStops, setPreviewStops] = useState([]);
  const [loadingFare, setLoadingFare] = useState(false);

  useEffect(() => {
    if (user?.token) fetchBuses();
  }, [user]);

  const fetchBuses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/operator/buses', config);
      setBuses(data);
    } catch (err) {
      console.error('Fetch Buses Error:', err);
    }
  };

  const handleSuggestPrice = async () => {
    if (!source || !destination) {
      alert('Please enter both source and destination first');
      return;
    }
    setLoadingFare(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/operator/calculate-fare?source=${source}&destination=${destination}`, config);
      setCalculatedDistance(data.distance);
      setPrice(data.suggestedPrice);
      setPreviewStops(data.stops || []);
    } catch (err) {
      console.error('Fare Calculation Error:', err);
      alert('Could not calculate fare/route. Please enter manually.');
    } finally {
      setLoadingFare(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/operator/buses', { name: busName, totalSeats }, config);
      setBusName('');
      setTotalSeats(40);
      fetchBuses();
      alert('Bus added successfully!');
    } catch (err) {
      console.error('Add Bus Error:', err);
      alert('Error adding bus: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!travelDate) {
      alert('Please select a travel date');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/operator/schedules', {
        busId: scheduleBusId, 
        source, 
        destination, 
        departureTime, 
        arrivalTime, 
        price, 
        date: travelDate,
        dynamicPricing
      }, config);
      alert('Schedule added successfully!');
      // Clear fields
      setSource('');
      setDestination('');
      setPrice('');
      setTravelDate('');
      setCalculatedDistance(null);
      setPreviewStops([]);
    } catch (err) {
      console.error('Add Schedule Error:', err);
      alert('Error adding schedule: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!user || user.role !== 'operator') {
    return <div className="p-4 text-center">Access Denied. Operators only.</div>;
  }

  return (
    <div className="operator-dashboard dash-container">
      <header className="dashboard-header animate-fade">
        <div className="badge-featured">VENDOR CONSOLE</div>
        <h1>Fleet Operations Hub</h1>
        <p>Intelligent route scheduling with real-time station identification.</p>
      </header>
      
      <div className="dashboard-grid">
        
        {/* ADD BUS CARD */}
        <section className="dashboard-section card animate-slide">
          <div className="section-head">
            <div className="icon-wrap"><BusIcon size={20} /></div>
            <h3>Vehicle Inventory</h3>
          </div>
          <form onSubmit={handleAddBus} className="entry-form">
            <div className="input-field">
                <label>Model & Registration</label>
                <input type="text" placeholder="e.g. Volvo B11R [MH-01-AB-1234]" value={busName} onChange={(e) => setBusName(e.target.value)} required />
            </div>
            <div className="input-field">
                <label>Capacity (Seats)</label>
                <input type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} required min="10" max="60" />
            </div>
            <button type="submit" className="action-btn register">ADD VEHICLE</button>
          </form>
        </section>

        {/* ADD SCHEDULE CARD */}
        <section className="dashboard-section card animate-slide" style={{ animationDelay: '0.1s' }}>
          <div className="section-head">
            <div className="icon-wrap"><RouteIcon size={20} /></div>
            <h3>Journey Intelligence</h3>
          </div>
          <form onSubmit={handleAddSchedule} className="entry-form">
            <div className="input-field">
                <label>Active Vehicle</label>
                <select value={scheduleBusId} onChange={(e) => setScheduleBusId(e.target.value)} required>
                  <option value="">Choose an available bus...</option>
                  {buses.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
            </div>

            <div className="multi-field">
                <div className="input-field">
                    <label>From</label>
                    <input type="text" placeholder="Origin City" value={source} onChange={(e) => setSource(e.target.value)} required />
                </div>
                <div className="input-field">
                    <label>To</label>
                    <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                </div>
            </div>

            <div className="input-field">
                <label>Departure Date</label>
                <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required />
            </div>

            <div className="multi-field">
                <div className="input-field">
                    <label>Departure Time</label>
                    <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                </div>
                <div className="input-field">
                    <label>Estimated Arrival</label>
                    <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required />
                </div>
            </div>

            <div className="pricing-intelligence">
                <div className="input-field">
                    <label>Dynamic Pricing (INR)</label>
                    <div className="calc-input-group">
                        <DollarSign size={16} className="pre-icon" />
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={price} 
                          onChange={(e) => setPrice(e.target.value)} 
                          required 
                        />
                        <button 
                          type="button" 
                          className="ai-calc-btn"
                          onClick={handleSuggestPrice}
                          disabled={loadingFare}
                        >
                          {loadingFare ? <div className="spinner-sm"></div> : <Calculator size={18} />}
                        </button>
                    </div>
                </div>
                
                {calculatedDistance && (
                    <div className="insight-card animate-fade">
                        <div className="insight-row">
                            <Info size={16} />
                            <span>Road Distance: <strong>{calculatedDistance} km</strong></span>
                        </div>
                        
                        {previewStops.length > 0 && (
                            <div className="stations-preview">
                                <label>Identified Stations:</label>
                                <div className="stops-list">
                                    {previewStops.map((stop, i) => (
                                        <div key={i} className="stop-chip">
                                            <CheckCircle2 size={12} />
                                            {stop}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="feature-toggle">
                <label className="switch">
                  <input type="checkbox" checked={dynamicPricing} onChange={(e) => setDynamicPricing(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <div className="feature-text">
                    <strong>Yield Optimization</strong>
                    <span>Enables surge pricing based on real-time availability.</span>
                </div>
            </div>

            <button type="submit" className="action-btn publish">PUBLISH LIVE JOURNEY</button>
          </form>
        </section>

      </div>

      <style>{`
        .operator-dashboard { padding: 9rem 1rem 4rem; max-width: 1200px; margin: 0 auto; }
        .badge-featured { background: #fee2e2; color: #ef4444; font-size: 0.75rem; font-weight: 900; padding: 6px 16px; border-radius: 99px; display: inline-block; margin-bottom: 1.5rem; letter-spacing: 1.5px; border: 1px solid #fecaca; }
        .dashboard-header { text-align: center; margin-bottom: 5rem; position: relative; }
        .dashboard-header h1 { font-size: 3.5rem; font-weight: 900; color: #1a202c; letter-spacing: -2px; margin-bottom: 1rem; line-height: 1; }
        .dashboard-header p { color: #718096; font-size: 1.25rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }

        .dashboard-grid { display: grid; grid-template-columns: 400px 1fr; gap: 2.5rem; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }

        .card { background: white; border-radius: 30px; padding: 3rem; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
        .section-head { display: flex; align-items: center; gap: 15px; margin-bottom: 2.5rem; }
        .icon-wrap { background: #fef2f2; color: #ef4444; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .section-head h3 { font-size: 1.4rem; font-weight: 800; color: #2d3748; margin: 0; }

        .entry-form { display: flex; flex-direction: column; gap: 1.8rem; }
        .input-field { display: flex; flex-direction: column; gap: 10px; }
        .input-field label { font-size: 0.75rem; font-weight: 800; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-field input, .input-field select { 
            padding: 1.3rem; 
            border: 2px solid #edf2f7; 
            border-radius: 20px; 
            font-size: 1.05rem; 
            background: #f8fafc;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .input-field input:focus { border-color: #ef4444; background: white; outline: none; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.05); }
        
        .multi-field { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
        
        .calc-input-group { position: relative; display: flex; align-items: center; }
        .calc-input-group input { padding-left: 3rem; width: 100%; padding-right: 4.5rem; }
        .pre-icon { position: absolute; left: 1.2rem; color: #a0aec0; }
        
        .ai-calc-btn { 
            position: absolute; 
            right: 0.8rem; 
            background: #1a202c; 
            color: white; 
            border: none; 
            width: 44px; 
            height: 44px; 
            border-radius: 14px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer;
            transition: transform 0.2s;
        }
        .ai-calc-btn:hover { transform: scale(1.05); background: #2d3748; }

        .insight-card { background: #f1f5f9; padding: 1.5rem; border-radius: 20px; border: 1px dashed #cbd5e0; }
        .insight-row { display: flex; align-items: center; gap: 12px; color: #475569; font-size: 0.9rem; margin-bottom: 1rem; }
        
        .stations-preview { border-top: 1px solid #e2e8f0; padding-top: 1rem; }
        .stations-preview label { display: block; font-size: 0.7rem; font-weight: 800; color: #718096; margin-bottom: 10px; text-transform: uppercase; }
        .stops-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .stop-chip { background: white; color: #ef4444; border: 1px solid #fee2e2; padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }

        .feature-toggle { display: flex; gap: 18px; align-items: center; background: #fffcfc; padding: 1.5rem; border-radius: 20px; border: 1px solid #fff5f5; }
        .feature-text { display: flex; flex-direction: column; }
        .feature-text strong { font-size: 0.95rem; color: #1a202c; }
        .feature-text span { font-size: 0.75rem; color: #718096; }

        .action-btn { 
            padding: 1.4rem; 
            border: none; 
            border-radius: 20px; 
            font-weight: 900; 
            font-size: 1rem;
            letter-spacing: 1px; 
            cursor: pointer; 
            transition: all 0.3s ease;
        }
        .action-btn.register { background: #1a202c; color: white; }
        .action-btn.publish { background: #ef4444; color: white; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2); }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

        .switch { position: relative; display: inline-block; width: 50px; height: 26px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e2e8f0; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: #ef4444; }
        input:checked + .slider:before { transform: translateX(24px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        .spinner-sm { width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default OperatorBuses;
