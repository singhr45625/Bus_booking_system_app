import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Download, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import TicketTemplate from '../components/TicketTemplate';
import toast from 'react-hot-toast';
import { X, AlertTriangle, CreditCard, RotateCcw } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalType, setModalType] = useState(null); // 'pay' or 'cancel'
  const { user, refreshUser } = useContext(AuthContext);

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
      toast.success('Balance paid successfully!');
      if (refreshUser) refreshUser();
      
      const { data } = await axios.get('/api/bookings/my-bookings', config);
      setBookings(data);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/bookings/${bookingId}/cancel`, {}, config);
      
      toast.success(`Booking Cancelled. Refund of ₹${data.refundAmount} sent to wallet.`);
      if (refreshUser) refreshUser();
      
      const res = await axios.get('/api/bookings/my-bookings', config);
      setBookings(res.data);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancellation failed');
    }
  };

  const openModal = (booking, type) => {
    setSelectedBooking(booking);
    setModalType(type);
    setIsModalOpen(true);
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
                
                    <div style={{ marginTop: '10px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <small style={{ display: 'block', color: '#b45309', fontWeight: '700' }}>Balance: ₹{b.remainingBalance.toLocaleString()}</small>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="btn-primary" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#b45309' }}
                                onClick={() => openModal(b, 'cancel')}
                            >
                                CANCEL
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                onClick={() => openModal(b, 'pay')}
                            >
                                PAY BALANCE
                            </button>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: '#d97706', marginTop: '4px', maxWidth: '180px', lineHeight: '1.2' }}>
                            Pay by travel date ({b.bus?.date}) or seat will be released.
                        </p>
                    </div>
                )}

                {b.status === 'Confirmed' && (
                  <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', marginTop: '10px' }}
                      onClick={() => openModal(b, 'cancel')}
                  >
                      CANCEL TICKET
                  </button>
                )}
              </div>
            </div>
        ))
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade" style={{ background: 'white', padding: '2rem', borderRadius: '15px', maxWidth: '400px', width: '90%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
              <X size={20} />
            </button>

            {modalType === 'pay' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#f0fdf4', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <CreditCard size={30} color="#15904f" />
                </div>
                <h3 style={{ marginBottom: '1rem' }}>Confirm Payment</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  You are about to pay the remaining balance of <strong>₹{selectedBooking?.remainingBalance.toLocaleString()}</strong> from your wallet.
                </p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.8rem' }}
                  onClick={() => handlePayBalance(selectedBooking._id)}
                >
                  CONFIRM & PAY
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fef2f2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <AlertTriangle size={30} color="#b91c1c" />
                </div>
                <h3 style={{ marginBottom: '1rem' }}>Cancel Booking?</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Are you sure you want to cancel your booking for <strong>{selectedBooking?.bus?.name}</strong>?
                </p>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Paid Amount:</span>
                    <span>₹{selectedBooking?.paidAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', marginBottom: '0.5rem' }}>
                    <span>Cancellation Fee (20%):</span>
                    <span>- ₹{(selectedBooking?.paidAmount * 0.2).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px solid #eee', paddingTop: '0.5rem', color: '#15904f' }}>
                    <span>Refund to Wallet:</span>
                    <span>₹{(selectedBooking?.paidAmount * 0.8).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.8rem', background: '#b91c1c' }}
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                >
                  <RotateCcw size={16} style={{ marginRight: '8px' }} /> CONFIRM CANCELLATION
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
