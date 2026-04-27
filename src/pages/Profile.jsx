import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Wallet, History, Settings, ChevronRight, LogOut, Camera, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import MockPaymentModal from '../components/MockPaymentModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, addWalletMoney, refreshUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { updateProfile } = useContext(AuthContext);

  // Settings State
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    refreshUser();
  }, []);

  const handlePaymentConfirm = async (amount) => {
    try {
      await addWalletMoney(amount);
      alert(`Success! ₹${amount} has been added to your account.`);
    } catch (err) {
      alert('Recharge failed. Please try again.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const updateData = { username, email };
      if (password) updateData.password = password;

      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page dash-container">
      <button 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 16px', color: '#666', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
      >
        <ChevronLeft size={18} /> BACK
      </button>
      <MockPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        onConfirm={handlePaymentConfirm} 
      />
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="avatar-wrapper">
              <div className="profile-avatar">{user?.username?.[0].toUpperCase()}</div>
              <button className="edit-avatar"><Camera size={16} /></button>
            </div>
            <h3>{user?.username}</h3>
            <span className="user-role">{user?.role?.toUpperCase()}</span>
          </div>

          <nav className="profile-nav">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <User size={18} /> Overview
            </button>
            <button className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')}>
              <Wallet size={18} /> Wallet
            </button>
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
              <History size={18} /> Booking History
            </button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={18} /> Settings
            </button>
            <hr />
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        <main className="profile-content">
          {activeTab === 'overview' && (
            <div className="tab-pane animate-fade">
              <h2>Account Overview</h2>
              <div className="info-grid">
                <div className="info-card">
                  <div className="icon-box"><User size={20} /></div>
                  <div className="details">
                    <label>Full Name</label>
                    <p>{user?.username}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="icon-box"><Mail size={20} /></div>
                  <div className="details">
                    <label>Email Address</label>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="icon-box"><Shield size={20} /></div>
                  <div className="details">
                    <label>Account Status</label>
                    <p>Verified</p>
                  </div>
                </div>
              </div>

              <div className="quick-stats-row">
                <div className="mini-stat">
                    <h3>{user?.walletBalance || 0}</h3>
                    <span>Wallet Credits</span>
                </div>
                <div className="mini-stat">
                    <h3>12</h3>
                    <span>Trips Completed</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="tab-pane animate-fade">
              <h2>Wallet & Payments</h2>
              <div className="profile-balance-card">
                <div className="balance-info">
                    <span>Account Balance</span>
                    <h1>₹{user?.walletBalance?.toLocaleString() || '0'}</h1>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto' }}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Add Credits
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-pane animate-fade">
              <h2>Account Settings</h2>
              
              {message.text && (
                <div className={`alert-box ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="settings-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="input-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Enter new username"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter new email"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Security</h3>
                  <div className="input-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="input-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .profile-page { padding: 2rem 1rem; }
        .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 3rem; }
        
        .profile-sidebar { display: flex; flex-direction: column; gap: 2rem; }
        .profile-card { background: white; padding: 2.5rem; border-radius: 20px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid #f0f0f0; }
        
        .avatar-wrapper { position: relative; width: 100px; height: 100px; margin: 0 auto 1.5rem; }
        .profile-avatar { width: 100%; height: 100%; background: var(--secondary); color: white; border-radius: 30px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900; }
        .edit-avatar { position: absolute; bottom: 0; right: 0; background: var(--primary); color: white; border: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid white; }
        
        .user-role { font-size: 0.7rem; font-weight: 900; color: var(--primary); background: #fff5f5; padding: 4px 12px; border-radius: 99px; letter-spacing: 1px; }
        
        .profile-nav { background: white; border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); border: 1px solid #f0f0f0; }
        .profile-nav button { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; border: none; background: none; color: #444; font-weight: 700; font-size: 0.95rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; text-align: left; }
        .profile-nav button:hover { background: #f8f9fa; color: var(--primary); }
        .profile-nav button.active { background: #fff5f5; color: var(--primary); }
        .profile-nav .logout-btn { color: #ef4444; }
        .profile-nav .logout-btn:hover { background: #fef2f2; }
        
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .info-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #eee; display: flex; align-items: center; gap: 15px; }
        .info-card .icon-box { background: #f8f9fa; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--secondary); }
        .info-card label { display: block; font-size: 0.7rem; font-weight: 800; color: #aaa; text-transform: uppercase; margin-bottom: 2px; }
        .info-card p { font-weight: 700; margin: 0; font-size: 1rem; }
        
        .quick-stats-row { display: flex; gap: 1.5rem; margin-top: 2rem; }
        .mini-stat { flex: 1; background: white; padding: 2rem; border-radius: 16px; border: 1px solid #eee; text-align: center; }
        .mini-stat h3 { font-size: 2rem; font-weight: 900; margin: 0 0 5px 0; }
        .mini-stat span { font-size: 0.8rem; color: #aaa; font-weight: 700; text-transform: uppercase; }
        
        .profile-balance-card { background: var(--secondary); color: white; padding: 3rem; border-radius: 30px; display: flex; justify-content: space-between; align-items: center; }
        .balance-info span { font-size: 0.9rem; opacity: 0.7; font-weight: 600; }
        .balance-info h1 { font-size: 3.5rem; font-weight: 900; margin: 0.5rem 0 0 0; letter-spacing: -2px; }

        .settings-form { display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem; }
        .form-section { background: white; padding: 2rem; border-radius: 20px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 1.5rem; }
        .form-section h3 { margin: 0; font-size: 1.1rem; color: var(--secondary); border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.8rem; font-weight: 700; color: #666; }
        .input-group input { padding: 12px 16px; border: 1px solid #ddd; border-radius: 12px; font-size: 1rem; transition: all 0.3s ease; }
        .input-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(255, 71, 87, 0.1); }
        
        .alert-box { padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 600; font-size: 0.9rem; }
        .alert-box.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .alert-box.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        @media (max-width: 992px) {
          .profile-layout { grid-template-columns: 1fr; gap: 2rem; }
          .profile-nav { flex-direction: row; overflow-x: auto; padding: 1rem; }
          .profile-nav button { white-space: nowrap; }
          .profile-sidebar { flex-direction: row; align-items: center; gap: 2rem; }
          .profile-card { flex: 1; padding: 1.5rem; }
        }

        @media (max-width: 768px) {
          .profile-sidebar { flex-direction: column; }
          .profile-balance-card { flex-direction: column; gap: 2rem; text-align: center; padding: 2rem; }
          .balance-info h1 { font-size: 2.5rem; }
          .quick-stats-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
