import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Download, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import TicketTemplate from '../components/TicketTemplate';
import toast from 'react-hot-toast';
import { X, AlertTriangle, CreditCard, RotateCcw, ChevronLeft } from 'lucide-react';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalType, setModalType] = useState(null); // 'pay' or 'cancel'
  const [isProcessing, setIsProcessing] = useState(false);
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
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
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
    <div className="my-bookings-container dash-container">
      <button 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 16px', color: '#666', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
      >
        <ChevronLeft size={18} /> BACK
      </button>
      <h2>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p className="empty-msg">No bookings found.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
              <div key={b._id} className="booking-card animate-fade">
                
                {/* Hidden Ticket Template for PDF Generation */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <TicketTemplate booking={b} id={`ticket-${b._id}`} />
                </div>
  
                <div className="booking-main">
                  <h3>{b.bus?.name || 'Bus Service'}</h3>
                  <p className="route-info">{b.bus?.source} ➔ {b.bus?.destination}</p>
                  <div className="passenger-info">
                    <strong>Passenger:</strong> {b.passengerDetails?.name || b.user?.username}
                  </div>
                  <div className="booking-actions">
                     <button onClick={() => handleDownloadPDF(b._id)} className="action-btn-outline">
                       <Download size={14} /> TICKET PDF
                     </button>
                     
                     <Link to={`/track/${b._id}`} className="action-btn-primary">
                       <Navigation size={14} /> TRACK BUS
                     </Link>
                  </div>
                </div>
  
                <div className="booking-meta">
                  <div className="seats-tag">
                    <Ticket size={14} /> {b.seatNumbers?.join(', ')}
                  </div>
                  <div className="price-tag">₹{b.totalPrice.toLocaleString()}</div>
                  <span className={`status-badge ${b.status?.replace(' ', '-').toLowerCase()}`}>
                      {b.status}
                  </span>
                  
                  {b.status === 'Partially Paid' && (
                    <div className="payment-summary">
                        <small className="balance-text">Balance: ₹{b.remainingBalance.toLocaleString()}</small>
                        <div className="payment-btns">
                            {b.status !== 'Boarded' && (
                              <button className="cancel-btn" onClick={() => openModal(b, 'cancel')}>CANCEL</button>
                            )}
                            <button className="pay-btn" onClick={() => openModal(b, 'pay')}>PAY BALANCE</button>
                        </div>
                        <p className="warning-text">Pay at least 4 hours before departure or seat will be automatically released.</p>
                    </div>
                  )}

                  {b.status === 'Confirmed' && b.status !== 'Boarded' && (
                    <button className="cancel-ticket-btn" onClick={() => openModal(b, 'cancel')}>
                        CANCEL TICKET
                    </button>
                  )}
                </div>
              </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            {modalType === 'pay' ? (
              <div className="modal-body">
                <div className="icon-circle success"><CreditCard size={30} /></div>
                <h3>Confirm Payment</h3>
                <p>You are about to pay the remaining balance of <strong>₹{selectedBooking?.remainingBalance.toLocaleString()}</strong> from your wallet.</p>
                <button className="btn-primary full-width" onClick={() => handlePayBalance(selectedBooking._id)} disabled={isProcessing}>
                  {isProcessing ? <><span className="spinner-sm"></span> PROCESSING...</> : 'CONFIRM & PAY'}
                </button>
              </div>
            ) : (
              <div className="modal-body">
                <div className="icon-circle danger"><AlertTriangle size={30} /></div>
                <h3>Cancel Booking?</h3>
                <p>Are you sure you want to cancel your booking for <strong>{selectedBooking?.bus?.name}</strong>?</p>
                <div className="refund-summary">
                  <div className="row"><span>Paid Amount:</span> <span>₹{selectedBooking?.paidAmount.toLocaleString()}</span></div>
                  <div className="row danger-text"><span>Cancellation Fee (20%):</span> <span>- ₹{(selectedBooking?.paidAmount * 0.2).toLocaleString()}</span></div>
                  <div className="row total success-text"><span>Refund to Wallet:</span> <span>₹{(selectedBooking?.paidAmount * 0.8).toLocaleString()}</span></div>
                </div>
                <button className="btn-primary full-width danger-bg" onClick={() => handleCancelBooking(selectedBooking._id)} disabled={isProcessing}>
                  {isProcessing ? <><span className="spinner-sm"></span> CANCELLING...</> : <><RotateCcw size={16} /> CONFIRM CANCELLATION</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .my-bookings-container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
        .my-bookings-container h2 { margin-bottom: 2rem; color: var(--secondary); font-size: 1.8rem; font-weight: 800; }
        .bookings-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .booking-card { background: white; border-radius: 16px; padding: 1.5rem; display: flex; justify-content: space-between; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); transition: var(--transition); }
        .booking-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        
        .booking-main h3 { margin: 0 0 0.5rem 0; font-size: 1.3rem; color: var(--text-main); }
        .route-info { font-weight: 700; color: var(--primary); margin: 0 0 1rem 0; font-size: 1.1rem; }
        .passenger-info { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; }
        
        .booking-actions { display: flex; gap: 10px; }
        .action-btn-outline { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 0.8rem; font-weight: 700; cursor: pointer; color: var(--text-main); transition: var(--transition); }
        .action-btn-outline:hover { background: var(--bg-light); border-color: var(--text-main); }
        .action-btn-primary { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; background: var(--primary); color: white; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: none; transition: var(--transition); }
        .action-btn-primary:hover { background: var(--primary-hover); transform: scale(1.02); }

        .booking-meta { text-align: right; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
        .seats-tag { background: #f0f7ff; color: #106fba; padding: 5px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .price-tag { font-size: 1.5rem; font-weight: 900; color: var(--secondary); }
        
        .status-badge { font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-badge.confirmed { background: #eefaf3; color: #15904f; }
        .status-badge.partially-paid { background: #fffbeb; color: #b45309; }
        .status-badge.boarded { background: #eff6ff; color: #2563eb; }
        .status-badge.cancelled { background: #fef2f2; color: #b91c1c; }

        .payment-summary { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; padding: 10px; background: #fafafa; border-radius: 12px; }
        .balance-text { color: #b45309; font-weight: 800; font-size: 0.9rem; }
        .payment-btns { display: flex; gap: 8px; }
        .pay-btn { background: var(--secondary); color: white; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
        .cancel-btn { background: #fee2e2; color: #b91c1c; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
        .cancel-ticket-btn { padding: 0.6rem 1.2rem; font-size: 0.8rem; background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .warning-text { font-size: 0.7rem; color: #d97706; margin-top: 5px; max-width: 200px; line-height: 1.3; font-weight: 600; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; backdrop-filter: blur(5px); }
        .modal-content { background: white; padding: 2.5rem; border-radius: 24px; max-width: 450px; width: 90%; position: relative; box-shadow: var(--shadow-lg); }
        .close-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; cursor: pointer; color: #ccc; transition: var(--transition); }
        .close-btn:hover { color: var(--text-main); }
        .modal-body { text-align: center; }
        .icon-circle { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .icon-circle.success { background: #f0fdf4; color: #15904f; }
        .icon-circle.danger { background: #fef2f2; color: #b91c1c; }
        .refund-summary { background: #f9fafb; padding: 1.2rem; border-radius: 16px; margin: 1.5rem 0; text-align: left; font-size: 0.9rem; }
        .refund-summary .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .refund-summary .total { border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; font-weight: 800; }
        .danger-text { color: #b91c1c; }
        .success-text { color: #15904f; }
        .danger-bg { background: #b91c1c !important; }

        @media (max-width: 768px) {
          .booking-card { flex-direction: column; gap: 1.5rem; }
          .booking-meta { text-align: left; align-items: flex-start; border-top: 1px dashed var(--border-color); padding-top: 1.5rem; }
          .payment-summary { width: 100%; align-items: flex-start; }
          .payment-btns { width: 100%; }
          .payment-btns button { flex: 1; }
          .warning-text { max-width: none; }
          .booking-actions { flex-direction: column; width: 100%; }
          .booking-actions > * { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
