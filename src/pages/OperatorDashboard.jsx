import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/operator/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching operator stats', err);
      }
    };
    fetchStats();
  }, []);

  if (!user || user.role !== 'operator') {
    return <div className="p-4 text-center">Access Denied. Operator only.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Operator Dashboard</h2>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>
              ${stats.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Your Earnings (90%)</h3>
            <p style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>
              ${stats.operatorRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Recent Bookings</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {stats.recentBookings || 0}
            </p>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/operator/buses" className="btn-primary" style={{ textDecoration: 'none' }}>
          Manage Buses & Schedules
        </Link>
      </div>
    </div>
  );
};

export default OperatorDashboard;
