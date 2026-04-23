import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import io from 'socket.io-client';
import { Bus, Map as MapIcon, Users, Building, Wallet, Activity, ChevronLeft } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [fleet, setFleet] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const socketRef = useRef();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

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

    // Socket for fleet updates
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socketRef.current.on('fleetUpdate', (data) => {
      setFleet(data);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-center">Access Denied. Admins only.</div>;
  }

  const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '12px' };
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

  return (
    <div className="admin-dash-page">
      <div className="nav-container" style={{ padding: '2rem' }}>
        <button 
          className="back-btn"
          onClick={() => navigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 16px', color: '#666', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          <ChevronLeft size={18} /> BACK TO HOME
        </button>
        <header className="dash-header">
          <div>
            <h1>Admin Control Center</h1>
            <p>Platform overview and real-time fleet tracking</p>
          </div>
          <Link to="/admin/management" className="btn-primary" style={{ width: 'auto' }}>
            User Management
          </Link>
        </header>
        
        {stats ? (
          <div className="dash-grid animate-fade">
            <div className="dash-card">
              <div className="card-icon"><Users size={20} /></div>
              <h3>TOTAL USERS</h3>
              <p>{stats.users || 0}</p>
              <span className="card-sub">Active customers</span>
            </div>
            <div className="dash-card">
              <div className="card-icon"><Building size={20} /></div>
              <h3>TOTAL OPERATORS</h3>
              <p>{stats.operators || 0}</p>
              <span className="card-sub">Verified partners</span>
            </div>
            <div className="dash-card">
              <div className="card-icon"><Wallet size={20} /></div>
              <h3>GROSS REVENUE</h3>
              <p>₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
              <span className="card-sub">Across all routes</span>
            </div>
            <div className="dash-card revenue">
              <div className="card-icon"><Activity size={20} /></div>
              <h3>PLATFORM EARNINGS</h3>
              <p>₹{stats.platformRevenue?.toLocaleString() || '0'}</p>
              <span className="card-sub">10% commission</span>
            </div>
          </div>
        ) : (
          <div className="loading-placeholder">Loading stats...</div>
        )}

        {/* Live Fleet Map Section */}
        <section className="fleet-section card animate-slide" style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapIcon size={20} className="text-primary" />
              Live Fleet Tracking
            </h3>
            <span className="live-pill">● {fleet.length} BUSES ACTIVE</span>
          </div>
          
          <div className="map-wrapper shadow-sm">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={5}
                options={{ styles: mapStyles }}
              >
                {fleet.map(bus => (
                  <Marker
                    key={bus.id}
                    position={{ lat: bus.lat, lng: bus.lng }}
                    onClick={() => setSelectedBus(bus)}
                    icon={{
                      path: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM4 12V6h11v6H4z",
                      fillColor: bus.status === 'on_road' ? "#FF385C" : "#666",
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: "#ffffff",
                      scale: 1,
                      anchor: new window.google.maps.Point(12, 12),
                      rotation: bus.bearing || 0
                    }}
                  />
                ))}

                {/* Show stops for selected bus */}
                {selectedBus && selectedBus.intermediateStops && selectedBus.intermediateStops.map((stop, idx) => (
                  <Marker
                    key={`stop-${idx}`}
                    position={{ lat: stop.lat, lng: stop.lng }}
                    label={{
                      text: stop.name,
                      color: "#444",
                      fontSize: "10px",
                      fontWeight: "bold"
                    }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: stop.passed ? "#28a745" : "#ffc107",
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: "#fff",
                      scale: 6
                    }}
                  />
                ))}

                {selectedBus && (
                  <InfoWindow
                    position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
                    onCloseClick={() => setSelectedBus(null)}
                  >
                    <div style={{ padding: '10px', minWidth: '150px' }}>
                      <strong style={{ display: 'block', color: '#FF385C', marginBottom: '5px' }}>{selectedBus.name}</strong>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{selectedBus.busNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                        Status: <span style={{ color: selectedBus.status === 'on_road' ? '#28a745' : '#666' }}>{selectedBus.status.replace('_', ' ')}</span>
                      </div>
                      <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
                      <div style={{ fontSize: '0.7rem' }}>
                        Next Stop: {selectedBus.intermediateStops.find(s => !s.passed)?.name || 'N/A'}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div className="map-placeholder">Loading Fleet Map...</div>
            )}
          </div>
        </section>

        <div className="dashboard-sections">
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

          <section className="platform-health card animate-slide" style={{ animationDelay: '0.3s' }}>
            <div className="section-header">
              <h3>System Status</h3>
            </div>
            <div className="health-stats">
              <div className="health-item">
                <div className="dot online"></div>
                <span>API Server</span>
                <span className="status">Online</span>
              </div>
              <div className="health-item">
                <div className="dot online"></div>
                <span>Database</span>
                <span className="status">Stable</span>
              </div>
              <div className="health-item">
                <div className="dot online"></div>
                <span>Tracking Service</span>
                <span className="status">Active</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .admin-dash-page { background: #f8f9fa; min-height: 100vh; }
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .dash-header h1 { font-size: 2rem; margin: 0; }
        .dash-header p { color: var(--text-muted); margin: 0.5rem 0 0 0; }

        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .dash-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-sm); position: relative; border: 1px solid #eee; }
        .card-icon { width: 40px; height: 40px; border-radius: 12px; background: #f1f3f5; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: var(--secondary); }
        .dash-card.revenue { background: var(--secondary); color: white; border: none; }
        .dash-card.revenue .card-icon { background: rgba(255,255,255,0.1); color: white; }
        
        .dash-card h3 { font-size: 0.75rem; color: var(--text-muted); margin: 0 0 0.5rem 0; letter-spacing: 1px; font-weight: 800; }
        .dash-card.revenue h3 { color: #aaa; }
        .dash-card p { font-size: 2.2rem; font-weight: 900; margin: 0 0 0.2rem 0; }
        .card-sub { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        
        .live-pill { background: #ffebeb; color: #ff385c; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; }
        .map-wrapper { background: white; border-radius: 16px; overflow: hidden; padding: 5px; border: 1px solid #eee; }

        .dashboard-sections { display: grid; grid-template-columns: 2fr 1.2fr; gap: 2rem; margin-top: 2rem; }
        .card { background: white; border-radius: 16px; padding: 1.8rem; border: 1px solid #eee; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; }
        .view-link { font-size: 0.85rem; color: var(--primary); font-weight: 800; text-decoration: none; }
        
        .activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; background: #fbfbfb; transition: 0.2s; }
        .activity-item:hover { background: #f1f3f5; transform: translateX(5px); }
        .user-avatar { width: 40px; height: 40px; border-radius: 12px; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #666; }
        .activity-info { flex: 1; display: flex; flex-direction: column; }
        .user-name { font-size: 0.95rem; font-weight: 700; }
        .activity-time { font-size: 0.8rem; color: var(--text-muted); }
        .activity-amount { font-weight: 900; color: var(--accent); }

        .health-stats { display: flex; flex-direction: column; gap: 1.2rem; }
        .health-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem; border-radius: 10px; background: #f8f9fa; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.online { background: #00a699; box-shadow: 0 0 8px rgba(0, 166, 153, 0.4); }
        .health-item span { font-size: 0.9rem; font-weight: 600; flex: 1; }
        .health-item .status { font-size: 0.75rem; font-weight: 800; color: #00a699; text-transform: uppercase; }
        
        @media (max-width: 1024px) { .dashboard-sections { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .nav-container { padding: 1rem !important; }
          .dash-header { flex-direction: column; align-items: stretch; text-align: center; gap: 1rem; }
          .dash-header h1 { font-size: 1.5rem; }
          .dash-header p { font-size: 0.9rem; }
          .dash-header .btn-primary { width: 100%; justify-content: center; padding: 1rem; }
          
          .dash-grid { grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
          .dash-card { padding: 1rem; border-radius: 12px; }
          .dash-card p { font-size: 1.4rem; }
          .dash-card h3 { font-size: 0.65rem; }
          .card-icon { width: 32px; height: 32px; margin-bottom: 0.5rem; }
          
          .card { padding: 1.2rem; border-radius: 12px; }
          .section-header h3 { font-size: 1.1rem; }
          .map-wrapper { height: 250px; border-radius: 12px; }
          
          .activity-item { padding: 0.8rem; gap: 0.8rem; }
          .user-avatar { width: 32px; height: 32px; font-size: 0.8rem; }
          .user-name { font-size: 0.85rem; }
          .activity-amount { font-size: 0.9rem; }
          
          .health-item { padding: 0.6rem; gap: 8px; }
          .health-item span { font-size: 0.8rem; }
        }
        @media (max-width: 480px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const mapStyles = [
  { featureType: "administrative", elementType: "labels.text.fill", textColor: "#444444" },
  { featureType: "landscape", elementType: "all", color: "#f2f2f2" },
  { featureType: "poi", elementType: "all", visibility: "off" },
  { featureType: "road", elementType: "all", saturation: -100, lightness: 45 },
  { featureType: "road.highway", elementType: "all", visibility: "simplified" },
  { featureType: "road.arterial", elementType: "labels.icon", visibility: "off" },
  { featureType: "transit", elementType: "all", visibility: "off" },
  { featureType: "water", elementType: "all", color: "#beddf5", visibility: "on" }
];

export default AdminDashboard;
