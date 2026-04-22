import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-effect">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Bus size={28} style={{ marginRight: '8px' }} />
          <span>Smart<span style={{ color: '#3e3e52' }}>Bus</span></span>
        </Link>
        <nav>
          <div className="nav-links">
            <Link to={user?.role === 'operator' ? '/operator/dashboard' : (user?.role === 'admin' ? '/admin/dashboard' : '/')}>Home</Link>
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
                <Link to="/admin/management">User Management</Link>
              </>
            )}

            {user?.role === 'operator' && (
              <>
                <Link to="/operator/dashboard">Operator Panel</Link>
                <Link to="/operator/buses">Manage Buses</Link>
                <Link to="/operator/boarding">Points</Link>
              </>
            )}

            {user && (!user.role || user.role === 'user') && (
              <>
                <Link to="/my-bookings">My Bookings</Link>
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="wallet-badge" onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(21, 144, 79, 0.1)', padding: '6px 14px', borderRadius: '20px', color: '#15904f', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <Wallet size={16} />
                  <span>₹{user.walletBalance?.toLocaleString() || 0}</span>
                </div>
                <div className="user-profile">
                  <div className="user-info">
                    <User size={18} />
                    <span>{user.username}</span>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="login-link">Log In</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};


export default Navbar;
