import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Download, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import TicketTemplate from '../components/TicketTemplate';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/bookings/my-bookings', config);
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handlePayBalance = async (bookingId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`/api/bookings/${bookingId}/pay-balance`, {}, config);
      // Refresh bookings
      const { data } = await axios.get('/api/bookings/my-bookings', config);
      setBookings(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  const handleDownloadPDF = (bookingId) => {
    const element = document.getElementById(`ticket-${bookingId}`);
    const opt = {
      margin: 0,
      filename: `SmartBus-Ticket-${bookingId.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No bookings found.</p>
      ) : (
        bookings.map(b => (
            <div key={b._id} className="booking-item animate-fade" style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', border: '1px solid #f0f0f0' }}>
              
              {/* Hidden Ticket Template for PDF Generation */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <TicketTemplate booking={b} id={`ticket-${b._id}`} />
              </div>

              <div className="booking-main-info">
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{b.bus?.name || 'Bus Service'}</h3>
                <p className="route-info" style={{ fontWeight: '700', color: 'var(--secondary)', margin: '0 0 1rem 0' }}>{b.bus?.source} ➔ {b.bus?.destination}</p>
                <div className="passenger-compact" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Passenger:</strong> {b.passengerDetails?.name || b.user?.username}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                   <button 
                     onClick={() => handleDownloadPDF(b._id)}
                     style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                   >
                     <Download size={14} /> TICKET PDF
                   </button>
                   
                   <Link 
                     to={`/track/${b._id}`}
                     style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' }}
                   >
                     <Navigation size={14} /> TRACK BUS
                   </Link>
                </div>
              </div>
              <div className="booking-meta" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div className="seats-tag" style={{ background: '#f0f4f8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                  <Ticket size={14} /> {b.seatNumbers?.join(', ')}
                </div>
                <div className="price-tag" style={{ fontSize: '1.2rem', fontWeight: '800' }}>₹{b.totalPrice.toLocaleString()}</div>
                <span className={`status-badge ${b.status?.replace(' ', '-').toLowerCase()}`} style={{ fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', background: b.status === 'Confirmed' ? '#eefaf3' : (b.status === 'Partially Paid' ? '#fffbeb' : '#fef2f2'), color: b.status === 'Confirmed' ? '#15904f' : (b.status === 'Partially Paid' ? '#b45309' : '#b91c1c') }}>
                    {b.status}
                </span>
                
                {b.status === 'Partially Paid' && (
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <small style={{ display: 'block', color: '#b45309', fontWeight: '700', marginBottom: '5px' }}>Balance: ₹{b.remainingBalance.toLocaleString()}</small>
                        <button 
                            className="btn-primary" 
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => handlePayBalance(b._id)}
                        >
                            PAY BALANCE
                        </button>
                        <p style={{ fontSize: '0.65rem', color: '#d97706', marginTop: '8px', maxWidth: '180px', lineHeight: '1.2' }}>
                            Important: Pay by travel date ({b.bus?.date}) or seat will be released.
                        </p>
                    </div>
                )}
              </div>
            </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;
