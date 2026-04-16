const StatsBar = () => (
    <div className="stats-bar dash-container">
        <div className="stat-item">
            <h2>300+</h2>
            <span>Daily Routes</span>
        </div>
        <div className="stat-item">
            <h2>50k+</h2>
            <span>Happy Users</span>
        </div>
        <div className="stat-item">
            <h2>120+</h2>
            <span>Bus Partners</span>
        </div>
        <div className="stat-item">
            <h2>98%</h2>
            <span>On-time Rate</span>
        </div>
        <style>{`
            .stats-bar { display: flex; justify-content: space-around; padding: 4rem 1rem; background: white; border-radius: 30px; margin-top: -4rem; position: relative; z-index: 10; box-shadow: 0 15px 40px rgba(0,0,0,0.05); }
            .stat-item { text-align: center; }
            .stat-item h2 { font-size: 2.2rem; font-weight: 900; color: var(--secondary); margin: 0; }
            .stat-item span { font-size: 0.8rem; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 1px; }
        `}</style>
    </div>
);

export default StatsBar;
