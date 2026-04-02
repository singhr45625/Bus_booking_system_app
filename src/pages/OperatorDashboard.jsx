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
        <div className="dash-grid animate-fade">
          <div className="dash-card">
            <h3>TOTAL REVENUE</h3>
            <p>₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
            <span className="card-sub">Gross collections</span>
          </div>
          <div className="dash-card earnings">
            <h3>YOUR EARNINGS</h3>
            <p>₹{stats.operatorRevenue?.toLocaleString() || '0'}</p>
            <span className="card-sub">After 10% platform fee</span>
          </div>
          <div className="dash-card">
            <h3>TOTAL BOOKINGS</h3>
            <p>{stats.recentBookings || 0}</p>
            <span className="card-sub">Tickets sold</span>
          </div>
        </div>
      ) : (
        <div className="loading-placeholder">Loading stats...</div>
      )}

      <div className="dashboard-sections">
        <section className="chart-section card animate-slide">
          <div className="section-header">
            <h3>Revenue Trend</h3>
            <span className="date-range">Last 7 Days</span>
          </div>
          <div className="chart-container">
            <svg viewBox="0 0 800 200" className="revenue-chart">
              <path 
                d="M0,180 Q100,160 200,170 T400,120 T600,140 T800,60" 
                fill="none" 
                stroke="#15904f" 
                strokeWidth="4"
              />
              <path 
                d="M0,180 Q100,160 200,170 T400,120 T600,140 T800,60 L800,200 L0,200 Z" 
                fill="url(#operatorGradient)" 
                opacity="0.1"
              />
              <defs>
                <linearGradient id="operatorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15904f" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {/* Data points */}
              {[180, 160, 170, 120, 140, 60].map((y, i) => (
                <circle key={i} cx={i * 150} cy={y} r="5" fill="#15904f" />
              ))}
            </svg>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </section>

        <section className="quick-actions card animate-slide" style={{ animationDelay: '0.2s' }}>
          <h3>Quick Management</h3>
          <div className="action-grid">
            <Link to="/operator/buses" className="action-btn">
              <span className="icon">🚌</span>
              <span>Manage Buses</span>
            </Link>
            <Link to="/operator/boarding" className="action-btn">
              <span className="icon">📋</span>
              <span>Boarding Lists</span>
            </Link>
            <Link to="/operator/schedules" className="action-btn">
              <span className="icon">📅</span>
              <span>Update Schedules</span>
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .dash-card { background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: var(--shadow-sm); }
        .dash-card.earnings { background: #eefaf3; border-color: #c3e6cb; }
        .dash-card h3 { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 1px; }
        .dash-card p { font-size: 2.2rem; font-weight: 800; color: var(--secondary); margin-bottom: 0.2rem; }
        .dash-card.earnings p { color: #15904f; }
        .card-sub { font-size: 0.8rem; color: var(--text-muted); }
        
        .dashboard-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 2rem; }
        .card { background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; }
        .chart-container { position: relative; height: 250px; display: flex; flex-direction: column; justify-content: flex-end; }
        .revenue-chart { width: 100%; height: 200px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 10px 0; color: var(--text-muted); font-size: 0.75rem; }
        
        .action-grid { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .action-btn { display: flex; align-items: center; gap: 1.2rem; padding: 1rem; border-radius: 10px; background: #f8f9fa; text-decoration: none; color: var(--text-main); font-weight: 700; transition: 0.3s; }
        .action-btn:hover { background: #f0f1f2; transform: translateX(5px); color: var(--primary); }
        .action-btn .icon { font-size: 1.4rem; }
        
        .loading-placeholder { text-align: center; padding: 3rem; color: var(--text-muted); }
        
        @media (max-width: 1024px) { .dashboard-sections { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default OperatorDashboard;
