import { ShieldCheck, Map, Wallet, Zap } from 'lucide-react';

const FeatureSection = () => (
  <section className="features dash-container">
    <div className="section-title">
        <span className="badge">Why Choose Us</span>
        <h2>Experience the future of travel</h2>
        <p>We've combined world-class engineering with premium design to redefine bus travel.</p>
    </div>
    
    <div className="features-grid">
      <div className="feature-card">
        <div className="icon-main"><Map size={24} /></div>
        <h3>Live GPS Tracking</h3>
        <p>Know exactly where your bus is with real-time updates and intermediate station alerts.</p>
      </div>
      <div className="feature-card">
        <div className="icon-main"><ShieldCheck size={24} /></div>
        <h3>Secured Journeys</h3>
        <p>Every booking is protected. Verified operators and 24/7 support for your peace of mind.</p>
      </div>
      <div className="feature-card">
        <div className="icon-main"><Wallet size={24} /></div>
        <h3>Smart Wallet</h3>
        <p>One-tap payments and instant refunds. No more waiting for bank processing times.</p>
      </div>
      <div className="feature-card">
        <div className="icon-main"><Zap size={24} /></div>
        <h3>Dynamic Routing</h3>
        <p>Optimized routes for faster travel and smarter pricing based on real-time data.</p>
      </div>
    </div>
    <style>{`
      .features { padding: 8rem 1rem; }
      .section-title { text-align: center; margin-bottom: 5rem; }
      .badge { background: #fff5f5; color: var(--primary); font-size: 0.75rem; font-weight: 900; padding: 6px 16px; border-radius: 99px; letter-spacing: 1.5px; border: 1px solid #fee2e2; }
      .section-title h2 { font-size: 3rem; font-weight: 900; margin: 1.5rem 0; letter-spacing: -1px; }
      .section-title p { color: #717171; max-width: 600px; margin: 0 auto; font-size: 1.1rem; line-height: 1.6; }
      
      .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2.5rem; }
      .feature-card { background: white; padding: 3rem; border-radius: 30px; border: 1px solid #f0f0f0; transition: 0.3s; }
      .feature-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
      .feature-card .icon-main { background: #f8f9fa; width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: var(--secondary); margin-bottom: 2rem; }
      .feature-card h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; }
      .feature-card p { color: #717171; font-size: 0.95rem; line-height: 1.6; }
    `}</style>
  </section>
);

export default FeatureSection;
