import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats', err);
      }
    };
    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-center">Access Denied. Admins only.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Admin Dashboard</h2>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {stats.users || 0}
            </p>
          </div>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Total Operators</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {stats.operators || 0}
            </p>
          </div>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Total Revenue Flow</h3>
            <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>
              ${stats.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bus-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3>Platform Commission (10%)</h3>
            <p style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>
              ${stats.platformRevenue?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/admin/management" className="btn-primary" style={{ textDecoration: 'none' }}>
          Open Management Console
        </Link>
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
        <h4>Revenue Graph (Placeholder)</h4>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#666' }}>
          [ Charting requires an additional library like Recharts or Chart.js ]
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
