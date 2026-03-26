import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <Link to="/" className="logo">SmartBus</Link>
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin/dashboard">Admin</Link>}
            {user.role === 'operator' && <Link to="/operator/dashboard">Operator</Link>}
            {(!user.role || user.role === 'user') && <Link to="/my-bookings">My Bookings</Link>}
            
            <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '1rem', borderLeft: '1px solid #e5e5e5', paddingLeft: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                <User size={16} />
                {user.username}
              </span>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/login" style={{ fontWeight: 600 }}>Log In</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
