import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('users');
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    fetchData(tab);
  }, [tab]);

  const fetchData = async (currentTab) => {
    try {
      const { data } = await axios.get(`/api/admin/${currentTab}`);
      setDataList(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-center">Access Denied. Admins only.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <button 
        className="back-btn"
        onClick={() => navigate('/admin/dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 16px', color: '#666', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
      >
        <ChevronLeft size={18} /> BACK TO DASHBOARD
      </button>
      <h2>System Management</h2>
      
      <div className="tab-btn-group">
        <button className={tab === 'users' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('users')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Users</button>
        <button className={tab === 'operators' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('operators')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Operators</button>
        <button className={tab === 'bookings' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('bookings')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Bookings</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {tab === 'users' && (
                <><th>ID</th><th>Username</th><th>Email</th><th>Role</th></>
              )}
              {tab === 'operators' && (
                <><th>ID</th><th>Company Name</th><th>Owner</th><th>Email</th></>
              )}
              {tab === 'bookings' && (
                <><th>ID</th><th>Customer</th><th>Route</th><th>Dep. Time</th><th>Paid</th><th>Status</th></>
              )}
            </tr>
          </thead>
          <tbody>
            {dataList.length === 0 && (
              <tr><td colSpan="6" className="empty-cell">No data found.</td></tr>
            )}
            {dataList.map((item, idx) => (
              <tr key={idx}>
                {tab === 'users' && (
                  <><td>{item._id}</td><td>{item.username}</td><td>{item.email}</td><td>User</td></>
                )}
                {tab === 'operators' && (
                  <><td>{item._id}</td><td>{item.companyName || 'N/A'}</td><td>{item.username}</td><td>{item.email}</td></>
                )}
                {tab === 'bookings' && (
                  <><td>{item._id}</td><td>{item.user?.username}</td><td>{item.bus?.source} ➔ {item.bus?.destination}</td><td>{item.bus?.departureTime}</td><td>₹{item.totalPrice}</td><td>{item.status}</td></>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-wrapper { overflow-x: auto; background: white; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; }
        th { background: #f8f9fa; padding: 1rem; font-size: 0.8rem; font-weight: 800; color: #444; text-transform: uppercase; border-bottom: 2px solid #eee; }
        td { padding: 1rem; font-size: 0.9rem; border-bottom: 1px solid #eee; color: #666; }
        .empty-cell { text-align: center; color: #aaa; font-style: italic; }
        
        .tab-btn-group { 
          display: flex; 
          gap: 1rem; 
          border-bottom: 1px solid var(--border); 
          padding-bottom: 1rem; 
          margin-bottom: 2rem; 
          overflow-x: auto; 
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tab-btn-group::-webkit-scrollbar { display: none; }
        .tab-btn-group button { white-space: nowrap; flex-shrink: 0; }

        @media (max-width: 768px) {
          .container { padding: 1rem !important; }
          .back-btn { width: 100%; justify-content: center; }
          h2 { font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem; }
        }
      `}</style>

    </div>
  );
};

export default AdminManagement;
