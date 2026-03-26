import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminManagement = () => {
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
      <h2>System Management</h2>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button className={tab === 'users' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('users')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Users</button>
        <button className={tab === 'operators' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('operators')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Operators</button>
        <button className={tab === 'bookings' ? 'btn-primary' : 'btn-outline'} onClick={() => setTab('bookings')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Bookings</button>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
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
              <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>No data found.</td></tr>
            )}
            {dataList.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                {tab === 'users' && (
                  <><td style={{ padding: '0.5rem' }}>{item._id}</td><td style={{ padding: '0.5rem' }}>{item.username}</td><td style={{ padding: '0.5rem' }}>{item.email}</td><td style={{ padding: '0.5rem' }}>User</td></>
                )}
                {tab === 'operators' && (
                  <><td style={{ padding: '0.5rem' }}>{item._id}</td><td style={{ padding: '0.5rem' }}>{item.companyName || 'N/A'}</td><td style={{ padding: '0.5rem' }}>{item.username}</td><td style={{ padding: '0.5rem' }}>{item.email}</td></>
                )}
                {tab === 'bookings' && (
                  <><td style={{ padding: '0.5rem' }}>{item._id}</td><td style={{ padding: '0.5rem' }}>{item.user?.username}</td><td style={{ padding: '0.5rem' }}>{item.bus?.source} ➔ {item.bus?.destination}</td><td style={{ padding: '0.5rem' }}>{item.bus?.departureTime}</td><td style={{ padding: '0.5rem' }}>${item.totalPrice}</td><td style={{ padding: '0.5rem' }}>{item.status}</td></>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminManagement;
