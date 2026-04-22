import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Bus, ArrowRight, ShieldCheck, Clock, Star } from 'lucide-react';
import StatsBar from '../components/StatsBar';
import FeatureSection from '../components/FeatureSection';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const Home = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination) return alert('Please enter both source and destination');
    navigate(`/search?source=${source}&destination=${destination}&date=${date}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="dash-container">
          <div className="hero-content animate-slide-up">
            <div className="hero-badge">
              <Star size={14} fill="currentColor" />
              <span>India's Most Trusted Bus Network</span>
            </div>
            <h1>Travel Smarter with <br/><span className="text-gradient">Real-Time Tracking</span></h1>
            <p>Book premium inter-city buses and track your journey live like never before. 
               Experience the next generation of bus travel.</p>
            
            <div className="search-widget shadow-xl">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input">
                  <MapPin className="input-icon" size={20} />
                  <div className="input-group">
                    <label>From</label>
                    <input type="text" placeholder="Where are you?" value={source} onChange={(e) => setSource(e.target.value)} required />
                  </div>
                </div>
                <div className="search-divider"></div>
                <div className="search-input">
                  <MapPin className="input-icon" size={20} />
                  <div className="input-group">
                    <label>To</label>
                    <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                  </div>
                </div>
                <div className="search-divider"></div>
                <div className="search-input">
                  <Calendar className="input-icon" size={20} />
                  <div className="input-group">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="search-submit">
                  <span>Search Journeys</span>
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <StatsBar />
      <FeatureSection />
      
      {/* Dynamic Tracking Teaser */}
      <section className="tracking-teaser dash-container">
        <div className="teaser-card shadow-lg">
            <div className="teaser-info">
                <div className="icon-pill"><Clock size={20} /></div>
                <h2>Live Station Updates</h2>
                <p>No more guessing. Get precise arrival times for every intermediate stop on your route.</p>
                <div className="feature-badges">
                    <span>● Live GPS</span>
                    <span>● Traffic Aware</span>
                </div>
            </div>
            <div className="teaser-image-mock">
                <div className="mock-route">
                    <div className="route-line"></div>
                    <div className="route-dot passed"></div>
                    <div className="route-dot active"></div>
                    <div className="route-dot"></div>
                </div>
            </div>
        </div>
      </section>

      <FAQ />
      <Footer />

      <style>{`
        .home-page { overflow-x: hidden; }
        .hero-section { padding: 12rem 0 10rem; position: relative; }
        .hero-content { max-width: 900px; margin: 0 auto; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff5f5; color: var(--primary); padding: 8px 16px; border-radius: 99px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px; margin-bottom: 2rem; border: 1px solid #fee2e2; }
        
        .hero-content h1 { font-size: 4.8rem; font-weight: 900; line-height: 1.1; margin-bottom: 2rem; letter-spacing: -3px; }
        .text-gradient { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-content p { font-size: 1.35rem; color: #717171; max-width: 650px; margin: 0 auto 4rem; line-height: 1.6; }

        .search-widget { background: white; border-radius: 30px; padding: 1.2rem; display: flex; align-items: center; margin-top: 2rem; border: 1px solid #eee; }
        .search-form { display: flex; width: 100%; align-items: center; gap: 1rem; }
        .search-input { flex: 1; display: flex; align-items: center; gap: 15px; padding: 0.5rem 1.5rem; text-align: left; }
        .input-icon { color: var(--primary); }
        .input-group { display: flex; flex-direction: column; }
        .input-group label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
        .input-group input { border: none; font-size: 1rem; font-weight: 700; color: #2d3748; outline: none; width: 100%; }
        
        .search-divider { height: 40px; width: 1px; background: #eee; }
        .search-submit { background: var(--secondary); color: white; border: none; padding: 1.2rem 2.5rem; border-radius: 20px; font-weight: 900; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; }
        .search-submit:hover { transform: scale(1.02); opacity: 0.95; }

        .tracking-teaser { padding: 4rem 1rem 8rem; }
        .teaser-card { background: var(--secondary); border-radius: 40px; padding: 5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; color: white; }
        .teaser-info h2 { font-size: 3rem; font-weight: 900; margin: 1.5rem 0; letter-spacing: -1px; }
        .teaser-info p { font-size: 1.25rem; opacity: 0.8; line-height: 1.6; margin-bottom: 2.5rem; }
        .icon-pill { background: rgba(255,255,255,0.1); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .feature-badges { display: flex; gap: 1rem; }
        .feature-badges span { background: rgba(255,255,255,0.1); padding: 6px 16px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }

        .teaser-image-mock { background: rgba(0,0,0,0.1); border-radius: 30px; display: flex; align-items: center; justify-content: center; }
        .mock-route { height: 4px; width: 80%; background: rgba(255,255,255,0.1); position: relative; }
        .route-dot { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.3); top: -4px; }
        .route-dot.passed { background: #00A699; box-shadow: 0 0 10px #00A699; }
        .route-dot.active { background: white; left: 50%; box-shadow: 0 0 20px white; }
        .route-dot:nth-child(2) { left: 0%; }
        .route-dot:nth-child(4) { left: 100%; }

        @media (max-width: 1024px) { 
          .hero-content h1 { font-size: 3.5rem; }
          .search-widget { flex-direction: column; padding: 2rem; }
          .search-form { flex-direction: column; align-items: stretch; }
          .search-divider { display: none; }
          .teaser-card { grid-template-columns: 1fr; padding: 3rem; text-align: center; }
          .teaser-image-mock { height: 200px; }
          .icon-pill { margin: 0 auto; }
          .feature-badges { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Home;
