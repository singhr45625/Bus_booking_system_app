import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

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
  const [basePrice, setBasePrice] = useState('');
  const [dynamicPricing, setDynamicPricing] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const { data } = await axios.get('/api/operator/buses');
      setBuses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operator/buses', { name: busName, totalSeats });
      setBusName('');
      setTotalSeats(40);
      fetchBuses();
      alert('Bus added successfully!');
    } catch (err) {
      alert('Error adding bus');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operator/schedules', {
        busId: scheduleBusId, source, destination, departureTime, arrivalTime, basePrice, dynamicPricing
      });
      alert('Schedule added successfully!');
    } catch (err) {
      alert('Error adding schedule');
    }
  };

  if (!user || user.role !== 'operator') {
    return <div className="p-4 text-center">Access Denied.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Manage Buses & Schedules</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* ADD BUS FORM */}
        <div className="bus-card" style={{ padding: '1.5rem' }}>
          <h3>Add New Bus</h3>
          <form onSubmit={handleAddBus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" placeholder="Bus Name / Model" value={busName} onChange={(e) => setBusName(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
            <input type="number" placeholder="Total Seats" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
            <button type="submit" className="btn-primary">Add Bus</button>
          </form>
        </div>

        {/* ADD SCHEDULE FORM */}
        <div className="bus-card" style={{ padding: '1.5rem' }}>
          <h3>Schedule a Route</h3>
          <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <select value={scheduleBusId} onChange={(e) => setScheduleBusId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }}>
              <option value="">Select Bus</option>
              {buses.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.totalSeats} seats)</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input type="text" placeholder="Source City" value={source} onChange={(e) => setSource(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
                <input type="text" placeholder="Destination City" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input type="time" title="Departure" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
                <input type="time" title="Arrival" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
            </div>
            <input type="number" placeholder="Base Price ($)" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px' }} />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <input type="checkbox" checked={dynamicPricing} onChange={(e) => setDynamicPricing(e.target.checked)} />
              Enable Dynamic Pricing
            </label>
            <small style={{ color: 'var(--text-muted)' }}>Automatically adjusts base fare based on seat occupancy.</small>

            <button type="submit" className="btn-primary">Create Schedule</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default OperatorBuses;
