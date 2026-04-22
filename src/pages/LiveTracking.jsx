import { useState, useEffect, useRef } from 'react';
import { Bus as BusIcon, Navigation, Clock, ShieldCheck, Phone, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import axios from 'axios';

const libraries = ['places'];

// Get API Key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; 

const LiveTracking = () => {
  const { bookingId } = useParams();
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [bearing, setBearing] = useState(0);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get(`/api/bookings/${bookingId}`, config);
        
        if (data.bus) {
          setBus(data.bus);
          setStops(data.bus.intermediateStops || []);
          setLocation({
            lat: data.bus.currentLocation?.lat || 0,
            lng: data.bus.currentLocation?.lng || 0
          });
          setBearing(data.bus.bearing || 0);

      // Socket for real-time tracking
      socketRef.current = io('http://localhost:5000');
          socketRef.current.on(`busUpdate_${data.bus._id}`, (update) => {
            setLocation({ lat: update.lat, lng: update.lng });
            setBearing(update.bearing);
            if (update.intermediateStops) {
              setStops(update.intermediateStops);
            }
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Fetch Booking Error:', err);
        setLoading(false);
      }
    };

    fetchBookingDetails();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [bookingId]);

  const mapContainerStyle = { width: '100%', height: '100%' };

  // Calculate Next Stop
  const nextStop = stops.find(s => !s.passed);

  if (loading) return <div className="loading-state">Loading Tracking Data...</div>;
  if (!bus) return <div className="error-state">Bus data not found for this booking.</div>;

  return (
    <div className="tracking-page animate-fade">
      <div className="nav-container">
        <header className="tracking-header">
          <Link to="/my-bookings" className="back-btn">
            <ChevronLeft size={20} /> Back
          </Link>
          <div className="header-main">
            <h1>Live Tracking</h1>
            <div className="status-indicator">
              <span className="dot pulse-animation"></span>
              Live Reporting
            </div>
          </div>
        </header>

        <div className="tracking-layout">
          <div className="map-section shadow-lg">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location}
                zoom={10}
                options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
              >
                {/* Main Bus Marker */}
                <Marker 
                  position={location} 
                  icon={{
                    path: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM4 12V6h11v6H4z",
                    fillColor: "#FF385C",
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: "#ffffff",
                    scale: 1.5,
                    anchor: new window.google.maps.Point(12, 12),
                    rotation: bearing
                  }}
                />

                {/* Intermediate Stop Markers */}
                {stops.map((stop, idx) => (
                    <Marker 
                      key={idx}
                      position={{ lat: stop.lat, lng: stop.lng }}
                      label={{
                          text: stop.name,
                          className: 'map-label',
                          color: '#555',
                          fontSize: '10px'
                      }}
                      icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 5,
                          fillColor: stop.passed ? '#00A699' : '#fff',
                          fillOpacity: 1,
                          strokeWeight: 2,
                          strokeColor: stop.passed ? '#fff' : '#00A699'
                      }}
                    />
                ))}
              </GoogleMap>
            ) : (
              <div className="map-placeholder">Loading Google Maps...</div>
            )}
            <div className="quick-stats">
              <div className="stat-card">
                <Clock size={18} />
                <div><span className="label">ETA</span><span className="value">45 mins</span></div>
              </div>
              <div className="stat-card">
                <Navigation size={18} />
                <div><span className="label">Next Stop</span><span className="value">{nextStop?.name || bus.destination}</span></div>
              </div>
            </div>
          </div>

          <aside className="details-sidebar shadow-md">
            <div className="bus-identity">
              <div className="bus-icon-circle"><BusIcon size={24} color="white" /></div>
              <div className="info">
                <h3>{bus.name}</h3>
                <span className="bus-num">{bus.busNumber}</span>
              </div>
            </div>

            <div className="bus-meta-card animate-slide" style={{ animationDelay: '0.1s' }}>
              <div className="meta-item">
                <span className="meta-label">Type</span>
                <span className="meta-value">{bus.type}</span>
              </div>
              {bus.operatorContact && (
                <div className="meta-item">
                  <span className="meta-label">Operator Contact</span>
                  <span className="meta-value" style={{ color: '#ef4444', fontWeight: '800' }}>{bus.operatorContact}</span>
                </div>
              )}
            </div>

            <div className="live-stations-timeline">
                <h4>Live Stations</h4>
                <div className="timeline-container">
                    {/* Source */}
                    <div className="timeline-item passed">
                        <div className="node"><CheckCircle2 size={18} /></div>
                        <div className="content">
                            <span className="station">{bus.source}</span>
                            <span className="status">Origin</span>
                        </div>
                    </div>

                    {/* Dynamic Intermediate Stops */}
                    {stops.map((stop, i) => (
                        <div key={i} className={`timeline-item ${stop.passed ? 'passed' : ''}`}>
                            <div className="node">
                                {stop.passed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </div>
                            <div className="content">
                                <span className="station">{stop.name}</span>
                                <span className="status">{stop.passed ? 'Departed' : 'Arriving soon'}</span>
                            </div>
                        </div>
                    ))}

                    {/* Destination */}
                    <div className="timeline-item">
                        <div className="node"><Circle size={18} /></div>
                        <div className="content">
                            <span className="station">{bus.destination}</span>
                            <span className="status">Final Destination</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="driver-card">
              <div className="avatar">RD</div>
              <div className="driver-info"><strong>Ramesh Dutt</strong><span>Lead Captain</span></div>
              <button className="call-btn"><Phone size={18} /></button>
            </div>
          </aside>
        </div>
      </div>
      <style>{`
        .tracking-page { background: #f8f9fa; min-height: 100vh; padding: 2rem 0; }
        .tracking-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; }
        .back-btn { display: flex; align-items: center; text-decoration: none; color: var(--text-muted); font-weight: 700; background: white; padding: 0.5rem 1rem; border-radius: 10px; box-shadow: var(--shadow-sm); }
        .header-main { flex: 1; display: flex; align-items: center; gap: 1.5rem; }
        .header-main h1 { font-size: 1.8rem; margin: 0; }
        .status-indicator { background: #eefaf3; color: #15904f; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; }
        
        .map-label { font-weight: 700; background: white; padding: 2px 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #ddd; transform: translateY(-20px); }

        .tracking-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; height: 750px; }
        .map-section { background: white; border-radius: 20px; overflow: hidden; position: relative; }
        .quick-stats { position: absolute; bottom: 2rem; left: 2rem; display: flex; gap: 1rem; z-index: 10; }
        .stat-card { background: white; padding: 0.8rem 1.2rem; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-md); min-width: 140px; }
        .stat-card .label { display: block; font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
        .stat-card .value { font-size: 0.95rem; font-weight: 800; color: var(--secondary); }

        .details-sidebar { background: white; border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; overflow-y: auto; }
        .bus-identity { display: flex; align-items: center; gap: 15px; margin-bottom: 2rem; }
        .bus-icon-circle { background: var(--primary); width: 48px; height: 48px; border-radius: 15px; display: flex; align-items: center; justify-content: center; }

        .live-stations-timeline { margin-bottom: 2rem; }
        .live-stations-timeline h4 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.1rem; }
        
        .timeline-container { display: flex; flex-direction: column; position: relative; }
        .timeline-item { position: relative; padding-left: 2.5rem; padding-bottom: 2rem; }
        .timeline-item::before { content: ''; position: absolute; left: 8px; top: 18px; width: 2px; height: 100%; background: #eee; }
        .timeline-item:last-child::before { display: none; }
        .timeline-item.passed::before { background: #00A699; }
        
        .timeline-item .node { position: absolute; left: 0; top: 0; color: #ccc; background: white; z-index: 1; }
        .timeline-item.passed .node { color: #00A699; }
        .timeline-item .station { display: block; font-weight: 700; font-size: 0.95rem; }
        .timeline-item .status { font-size: 0.75rem; color: var(--text-muted); }
        .timeline-item.passed .station { color: var(--secondary); }

        .driver-card { background: #f8f9fa; border-radius: 16px; padding: 1.2rem; display: flex; align-items: center; gap: 12px; margin-top: auto; }
        .driver-card .avatar { width: 40px; height: 40px; background: #dee2e6; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #666; }
        .driver-info { flex: 1; display: flex; flex-direction: column; }
        .driver-info strong { font-size: 0.9rem; }
        .driver-info span { font-size: 0.75rem; color: var(--text-muted); }
        .call-btn { background: white; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--primary); }

        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(21, 144, 79, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(21, 144, 79, 0); } 100% { box-shadow: 0 0 0 0 rgba(21, 144, 79, 0); } }
      `}</style>
    </div>
  );
};

const mapStyles = [
  { featureType: "administrative", elementType: "labels.text.fill", textColor: "#444444" },
  { featureType: "landscape", elementType: "all", color: "#f2f2f2" },
  { featureType: "poi", elementType: "all", visibility: "off" },
  { featureType: "road", elementType: "all", saturation: -100, lightness: 45 },
  { featureType: "transit", elementType: "all", visibility: "off" },
  { featureType: "water", elementType: "all", color: "#beddf5", visibility: "on" }
];

export default LiveTracking;
