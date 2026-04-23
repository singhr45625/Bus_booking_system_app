import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, LogOut, Wallet, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="glass-effect">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <Bus size={28} style={{ marginRight: '8px' }} />
          <span>Smart<span style={{ color: '#3e3e52' }}>Bus</span></span>
        </Link>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={isMenuOpen ? 'nav-active' : ''}>
          <div className="nav-links">
            <Link to={user?.role === 'operator' ? '/operator/dashboard' : (user?.role === 'admin' ? '/admin/dashboard' : '/')} onClick={() => setIsMenuOpen(false)}>Home</Link>
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                <Link to="/admin/management" onClick={() => setIsMenuOpen(false)}>User Management</Link>
              </>
            )}

            {user?.role === 'operator' && (
              <>
                <Link to="/operator/dashboard" onClick={() => setIsMenuOpen(false)}>Operator Panel</Link>
                <Link to="/operator/buses" onClick={() => setIsMenuOpen(false)}>Manage Buses</Link>
                <Link to="/operator/boarding" onClick={() => setIsMenuOpen(false)}>Points</Link>
              </>
            )}

            {user && (!user.role || user.role === 'user') && (
              <>
                <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <div className="user-nav-group">
                <div className="wallet-badge" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
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
                <Link to="/login" className="login-link" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                <Link to="/signup" className="btn-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};


export default Navbar;
