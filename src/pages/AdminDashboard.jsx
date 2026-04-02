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
        <div className="dash-grid animate-fade">
          <div className="dash-card">
            <h3>TOTAL USERS</h3>
            <p>{stats.users || 0}</p>
            <span className="card-sub">Active customers</span>
          </div>
          <div className="dash-card">
            <h3>TOTAL OPERATORS</h3>
            <p>{stats.operators || 0}</p>
            <span className="card-sub">Verified partners</span>
          </div>
          <div className="dash-card">
            <h3>GROSS REVENUE</h3>
            <p>₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
            <span className="card-sub">Across all routes</span>
          </div>
          <div className="dash-card platform">
            <h3>PLATFORM EARNINGS</h3>
            <p>₹{stats.platformRevenue?.toLocaleString() || '0'}</p>
            <span className="card-sub">10% Commission</span>
          </div>
        </div>
      ) : (
        <div className="loading-placeholder">Loading stats...</div>
      )}

      <div className="dashboard-sections">
        <section className="chart-section card animate-slide">
          <div className="section-header">
            <h3>Revenue Growth</h3>
            <span className="date-range">Last 7 Days</span>
          </div>
          <div className="chart-container">
            <svg viewBox="0 0 800 200" className="revenue-chart">
              <path 
                d="M0,180 Q100,150 200,160 T400,100 T600,120 T800,40" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="4"
              />
              <path 
                d="M0,180 Q100,150 200,160 T400,100 T600,120 T800,40 L800,200 L0,200 Z" 
                fill="url(#chartGradient)" 
                opacity="0.1"
              />
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {/* Data points */}
              {[180, 150, 160, 100, 120, 40].map((y, i) => (
                <circle key={i} cx={i * 150} cy={y} r="5" fill="var(--primary)" />
              ))}
            </svg>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </section>

        <section className="activity-section card animate-slide" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h3>Recent Bookings</h3>
            <Link to="/admin/management" className="view-link">View All</Link>
          </div>
          <div className="activity-list">
            {[1,2,3,4].map(i => (
              <div key={i} className="activity-item">
                <div className="user-avatar">{String.fromCharCode(64 + i)}</div>
                <div className="activity-info">
                  <span className="user-name">User_{i} booked a seat</span>
                  <span className="activity-time">Just now</span>
                </div>
                <div className="activity-amount">+₹450</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .dash-card { background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm); position: relative; }
        .dash-card.platform { background: var(--secondary); color: white; border: none; }
        .dash-card h3 { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 1px; }
        .dash-card.platform h3 { color: #aaa; }
        .dash-card p { font-size: 2rem; font-weight: 800; margin-bottom: 0.2rem; }
        .card-sub { font-size: 0.8rem; color: var(--text-muted); }
        
        .dashboard-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 2rem; }
        .card { background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .date-range { font-size: 0.8rem; color: var(--text-muted); }
        .view-link { font-size: 0.85rem; color: var(--primary); font-weight: 700; text-decoration: none; }
        
        .chart-container { position: relative; height: 250px; display: flex; flex-direction: column; justify-content: flex-end; }
        .revenue-chart { width: 100%; height: 200px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 10px 0; color: var(--text-muted); font-size: 0.75rem; }
        
        .activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-radius: 8px; transition: 0.2s; }
        .activity-item:hover { background: #f8f9fa; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #666; }
        .activity-info { flex: 1; display: flex; flex-direction: column; }
        .user-name { font-size: 0.9rem; font-weight: 600; }
        .activity-time { font-size: 0.75rem; color: var(--text-muted); }
        .activity-amount { font-weight: 700; color: var(--accent); }
        
        @media (max-width: 1024px) { .dashboard-sections { grid-template-columns: 1fr; } }
      `}</style>

    </div>
  );
};

export default AdminDashboard;
