import { Bus, Shield, Navigation, Users } from 'lucide-react';

const Footer = () => (
  <footer className="main-footer">
    <div className="dash-container grid-footer">
      <div className="footer-brand">
        <div className="logo">
          <div className="logo-icon"><Bus size={20} color="white" /></div>
          <span>SmartBus<span className="logo-accent">.</span></span>
        </div>
        <p>Premium inter-city bus booking and real-time tracking platform.</p>
      </div>
      <div className="footer-links">
        <h4>Company</h4>
        <a href="#">About Us</a>
        <a href="#">Carriers</a>
        <a href="#">Contact</a>
      </div>
      <div className="footer-links">
        <h4>Product</h4>
        <a href="#">Live Tracking</a>
        <a href="#">Route Planning</a>
        <a href="#">Operator Portal</a>
      </div>
      <div className="footer-legal">
        <h4>Support</h4>
        <div className="trust-badge"><Shield size={16} /> Secure Payments</div>
        <div className="trust-badge"><Navigation size={16} /> GPS Enabled</div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; 2026 SmartBus Technologies. All rights reserved.</p>
    </div>
    <style>{`
      .main-footer { background: white; border-top: 1px solid #eee; padding-top: 5rem; }
      .grid-footer { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 4rem; margin-bottom: 5rem; }
      .footer-brand p { margin-top: 1.5rem; color: #717171; line-height: 1.6; }
      .footer-links { display: flex; flex-direction: column; gap: 1rem; }
      .footer-links h4, .footer-legal h4 { margin-top: 0; font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
      .footer-links a { text-decoration: none; color: #717171; font-weight: 600; font-size: 0.95rem; transition: 0.3s; }
      .footer-links a:hover { color: var(--primary); }
      .trust-badge { display: flex; align-items: center; gap: 10px; color: #444; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.8rem; }
      .footer-bottom { border-top: 1px solid #f0f0f0; padding: 2.5rem 0; text-align: center; color: #aaa; font-size: 0.85rem; font-weight: 600; }
    `}</style>
  </footer>
);

export default Footer;
