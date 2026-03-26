import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const OperatorBoarding = () => {
  const { user } = useContext(AuthContext);
  const [boardings, setBoardings] = useState([]);
  const [scheduleId, setScheduleId] = useState('');
  
  // Realistically we'd fetch schedules first and pick one, but keeping it simple for MVP
  // where the operator types the Schedule ID, or we fetch it from params.
  
  const fetchBoardings = async () => {
    if (!scheduleId) return;
    try {
      const { data } = await axios.get(`/api/operator/boardings/${scheduleId}`);
      setBoardings(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching boarding list');
    }
  };

  const markCollected = async (bookingId) => {
    try {
      await axios.post(`/api/operator/boardings/collect/${bookingId}`);
      fetchBoardings(); // refresh list
      alert('Amount collected!');
    } catch (err) {
      alert('Error updating payment');
    }
  };

  if (!user || user.role !== 'operator') {
    return <div className="p-4 text-center">Access Denied.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Boarding List</h2>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input 
          type="number" 
          placeholder="Enter Schedule ID" 
          value={scheduleId}
          onChange={(e) => setScheduleId(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
        <button onClick={fetchBoardings} className="btn-primary">View Passengers</button>
      </div>

      <div className="bus-list">
        {boardings.length === 0 ? <p>No passengers found.</p> : boardings.map(b => {
          const isPending = b.status !== 'Collected';
          return (
          <div key={b._id} className="bus-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignItems: 'center', padding: '1rem' }}>
            <div>
              <p style={{ fontWeight: 'bold' }}>{b.user?.username || 'Unknown'}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{b.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p>Seats: <b>{b.seatNumbers.join(', ')}</b></p>
            </div>
            <div>
              <p style={{ color: 'var(--success)' }}>Total: ${b.totalPrice}</p>
              {isPending && (
                <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Pending: ${b.totalPrice}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {isPending ? (
                <button onClick={() => markCollected(b._id)} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--accent)' }}>
                  Mark Collected
                </button>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Fully Paid</span>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default OperatorBoarding;
