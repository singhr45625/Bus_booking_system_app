import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, Phone, Mail, CreditCard, ChevronRight, CheckCircle, Info, Wallet, Download, ChevronLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import TicketTemplate from '../components/TicketTemplate';
import './Home.css';

const BookingPage = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1); // 1: Seats, 2: Details, 3: Payment
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialPercent, setPartialPercent] = useState(20); // 20 or 40
  const [loading, setLoading] = useState(true);

  // Passenger Form
  const [passengerInfo, setPassengerInfo] = useState({
    name: user?.username || '',
    age: '',
    gender: 'Male',
    email: user?.email || '',
    phone: ''
  });

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const { data } = await axios.get(`/api/buses/${busId}`);
        setBus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusDetails();
  }, [busId]);

  const toggleSeat = (seatId) => {
    if (bus.bookedSeats.includes(seatId)) return;

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const [lastBooking, setLastBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBooking = async () => {
    // Validation
    if (!passengerInfo.name || !passengerInfo.age || !passengerInfo.phone || !passengerInfo.email) {
      toast.error('Please fill in all passenger details');
      return;
    }

    setIsProcessing(true);
    try {
      // Mock Payment Process Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/bookings', {
        busId,
        seatNumbers: selectedSeats,
        passengerDetails: passengerInfo,
        isPartialPayment: isPartialPayment,
        partialPaymentPercentage: partialPercent
      }, config);

      setLastBooking(data);
      toast.success('Tickets confirmed!');
      // Refresh wallet balance in context
      if (typeof refreshUser === 'function') await refreshUser();

      setStep(3); // Success
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Check your wallet balance.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!lastBooking) return;
    const element = document.getElementById(`ticket-success`);
    const opt = {
      margin: 0,
      filename: `SmartBus-Ticket-${lastBooking._id?.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!bus) return <div className="error-state">Bus not found</div>;

  const calculateSeatPrice = (seatId) => {
    const isQuick = bus.quickTicketSeats?.includes(seatId);
    const base = bus.currentPrice || bus.price;
    return isQuick ? (base * 1.3) : base;
  };

  const totalFare = selectedSeats.reduce((acc, seatId) => acc + calculateSeatPrice(seatId), 0);
  const amountToPayNow = isPartialPayment ? totalFare * (partialPercent / 100) : totalFare;

  return (
    <div className="booking-page animate-fade">
      <div className="nav-container">
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 16px', color: '#666', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          <ChevronLeft size={18} /> BACK
        </button>

        {(user?.role === 'admin' || user?.role === 'operator') && (
          <div className="role-notice" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '12px', color: '#92400e', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
            <Info size={20} />
            You are viewing this layout as an {user.role}. Booking is restricted to customer accounts.
          </div>
        )}

        {/* Progress Stepper */}
        <div className="booking-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}><span>1</span> SELECT SEATS</div>
          <ChevronRight size={16} />
          <div className={`step ${step >= 2 ? 'active' : ''}`}><span>2</span> PASSENGER DETAILS</div>
          <ChevronRight size={16} />
          <div className={`step ${step >= 3 ? 'active' : ''}`}><span>3</span> PAYMENT</div>
        </div>

        <div className="booking-layout">
          <div className="booking-main card animate-slide">
            {step === 1 && (
              <div className="seat-selection-view">
                <h3>Select your seats</h3>
                <div className="seat-map-container">
                  <div className="driver-cabin">
                    <div className="steering"></div>
                  </div>
                  <div className="seats-grid">
                    {/* Mocking a 2x2 grid for demonstration */}
                    {Array.from({ length: 10 }, (_, row) => (
                      <div key={row} className="seat-row">
                        {['A', 'B', '', 'C', 'D'].map((col, idx) => {
                          if (col === '') return <div key={idx} className="aisle"></div>;
                          const seatId = `${col}${row + 1}`;
                          const isBooked = bus.bookedSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          return (
                            <div
                              key={seatId}
                              className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${bus.quickTicketSeats?.includes(seatId) ? 'quick-ticket' : ''}`}
                              onClick={() => toggleSeat(seatId)}
                              title={isBooked ? 'Booked' : `Seat ${seatId} - ₹${calculateSeatPrice(seatId)}`}
                            >
                              <div className="seat-handle"></div>
                              {bus.quickTicketSeats?.includes(seatId) && <div className="quick-badge">⚡</div>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="seat-legend">
                  <div className="legend-item"><div className="seat available"></div> Available</div>
                  <div className="legend-item"><div className="seat selected"></div> Selected</div>
                  <div className="legend-item"><div className="seat booked"></div> Booked</div>
                  <div className="legend-item"><div className="seat quick-ticket" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div> Quick Ticket (+30%)</div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="passenger-details-view animate-fade">
                <h3>Passenger Information</h3>
                <div className="details-form">
                  <div className="form-group">
                    <label><User size={16} /> Full Name</label>
                    <input
                      type="text"
                      value={passengerInfo.name}
                      onChange={e => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
                      placeholder="As per ID card"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        placeholder="Years"
                        value={passengerInfo.age}
                        onChange={e => setPassengerInfo({ ...passengerInfo, age: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={passengerInfo.gender}
                        onChange={e => setPassengerInfo({ ...passengerInfo, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label><Phone size={16} /> Mobile Number</label>
                    <input
                      type="text"
                      placeholder="+91 00000 00000"
                      value={passengerInfo.phone}
                      onChange={e => setPassengerInfo({ ...passengerInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label><Mail size={16} /> Email Address</label>
                    <input
                      type="email"
                      placeholder="ticket@example.com"
                      value={passengerInfo.email}
                      onChange={e => setPassengerInfo({ ...passengerInfo, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="payment-mock">
                  <h3><CreditCard size={18} /> Payment Options</h3>
                  <div className="payment-cards">
                    <div className={`p-card ${!isPartialPayment ? 'active' : ''}`} onClick={() => setIsPartialPayment(false)}>
                      Full Payment (100%)
                      <span className="p-amount">₹{totalFare.toLocaleString()}</span>
                    </div>
                    <div className={`p-card ${isPartialPayment && partialPercent === 20 ? 'active' : ''}`} onClick={() => {setIsPartialPayment(true); setPartialPercent(20)}}>
                      Partial Payment (20%)
                      <span className="p-amount">₹{(totalFare * 0.2).toLocaleString()}</span>
                      <small style={{ display: 'block', fontSize: '0.7rem', marginTop: '4px' }}>Pay remaining ₹{(totalFare * 0.8).toLocaleString()} on travel date</small>
                    </div>
                    <div className={`p-card ${isPartialPayment && partialPercent === 40 ? 'active' : ''}`} onClick={() => {setIsPartialPayment(true); setPartialPercent(40)}}>
                      Partial Payment (40%)
                      <span className="p-amount">₹{(totalFare * 0.4).toLocaleString()}</span>
                      <small style={{ display: 'block', fontSize: '0.7rem', marginTop: '4px' }}>Pay remaining ₹{(totalFare * 0.6).toLocaleString()} on travel date</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="success-view animate-fade">
                {/* Hidden Ticket Template for PDF Generation */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <TicketTemplate booking={lastBooking} id="ticket-success" />
                </div>

                <CheckCircle size={80} color="#15904f" />
                <h2>Booking Successful!</h2>
                <p>Your ticket has been sent to your email and WhatsApp.</p>
                <div className="ticket-summary">
                  <div className="row"><span>Booking ID:</span> <strong>#SB-{lastBooking?._id?.slice(-8).toUpperCase()}</strong></div>
                  <div className="row"><span>Bus:</span> <strong>{bus.name}</strong></div>
                  <div className="row"><span>Seats:</span> <strong>{selectedSeats.join(', ')}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  <button
                    className="download-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                    onClick={handleDownloadPDF}
                  >
                    <Download size={18} /> DOWNLOAD TICKET PDF
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/my-bookings')}>MY BOOKINGS</button>
                </div>
              </div>
            )}
          </div>

          {step < 3 && (
            <aside className="booking-sidebar">
              <div className="card fare-card animate-fade">
                <h3>Fare Summary</h3>
                <div className="fare-row">
                  <span>Base Fare ({selectedSeats.length} Seats)</span>
                  <span>₹{totalFare}</span>
                </div>
                <div className="fare-row">
                  <span>Service Fee</span>
                  <span>₹25</span>
                </div>
                <div className="fare-total">
                  <span>Amount to Pay Now</span>
                  <span>₹{selectedSeats.length > 0 ? (amountToPayNow + 25).toLocaleString() : 0}</span>
                </div>
                {isPartialPayment && (
                  <>
                    <div className="fare-row" style={{ marginTop: '10px', color: '#666', fontSize: '0.85rem' }}>
                      <span>Remaining Balance</span>
                      <span>₹{(totalFare * (1 - partialPercent / 100)).toLocaleString()}</span>
                    </div>
                    <div className="partial-warning" style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '8px', margin: '15px 0', fontSize: '0.75rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>Remaining balance must be paid by travel date. Unpaid seats are released and resold at a premium.</span>
                    </div>
                  </>
                )}

                <div className="wallet-status" style={{ margin: '20px 0', padding: '15px', borderRadius: '12px', background: (user?.walletBalance < (amountToPayNow + 25)) ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: (user?.walletBalance < (amountToPayNow + 25)) ? '#fee2e2' : '#dcfce7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wallet size={16} color={(user?.walletBalance < (amountToPayNow + 25)) ? '#b91c1c' : '#166534'} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: (user?.walletBalance < (amountToPayNow + 25)) ? '#b91c1c' : '#166534' }}>WALLET BALANCE</span>
                    </div>
                    <strong style={{ color: (user?.walletBalance < (amountToPayNow + 25)) ? '#b91c1c' : '#166534' }}>₹{user?.walletBalance?.toLocaleString() || 0}</strong>
                  </div>
                  {user?.walletBalance < (amountToPayNow + 25) && (
                    <button
                      onClick={() => navigate('/profile')}
                      style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', background: '#b91c1c', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      INSUFFICIENT BALANCE - RECHARGE
                    </button>
                  )}
                </div>

                <div className="booking-info">
                  <Info size={16} />
                  <p>Payment will be deducted from your SmartBus Wallet. Ensure sufficient balance before proceeding.</p>
                </div>

                {step === 1 ? (
                  <button
                    className="btn-primary full-width"
                    disabled={selectedSeats.length === 0 || (user?.role !== 'user')}
                    onClick={() => setStep(2)}
                  >
                    {user?.role !== 'user' ? 'READ ONLY VIEW' : 'PROCEED TO DETAILS'}
                  </button>
                ) : (
                  <button
                    className="btn-primary full-width"
                    onClick={handleBooking}
                    disabled={isProcessing || (user?.role !== 'user')}
                  >
                    {user?.role !== 'user' ? 'BOOKING RESTRICTED' : (isProcessing ? 'PROCESSING...' : 'PAY & CONFIRM')}
                  </button>
                )}

                {step === 2 && (
                  <button className="btn-secondary full-width" style={{ marginTop: '10px' }} onClick={() => setStep(1)}>
                    BACK TO SEATS
                  </button>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        .booking-page { background: #f7f9fb; min-height: 100vh; padding: 2rem 0; }
        .booking-stepper { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 2rem; color: #999; }
        .booking-stepper .step { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.85rem; }
        .booking-stepper .step.active { color: var(--secondary); }
        .booking-stepper .step span { width: 24px; height: 24px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
        .booking-stepper .step.active span { background: var(--primary); color: white; }

        .booking-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
        .card { background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 2rem; }
        .booking-main h3 { margin-bottom: 2rem; font-size: 1.4rem; color: var(--secondary); }

        /* Seat Map Styling */
        .seat-map-container { 
          max-width: 250px; 
          margin: 0 auto; 
          border: 2px solid #ddd; 
          border-radius: 10px 10px 30px 30px; 
          padding: 30px 20px;
          position: relative;
        }
        .driver-cabin { border-bottom: 2px solid #eee; margin-bottom: 30px; display: flex; justify-content: flex-end; padding-bottom: 10px; }
        .steering { width: 30px; height: 30px; border: 4px solid #999; border-radius: 50%; position: relative; }
        .steering::before { content: ''; position: absolute; width: 100%; height: 2px; background: #999; top: 50%; }

        .seat-row { display: flex; gap: 15px; margin-bottom: 15px; justify-content: center; }
        .seat { 
          width: 32px; 
          height: 32px; 
          border: 2px solid #3e3e52; 
          border-radius: 4px; 
          position: relative; 
          cursor: pointer;
          transition: var(--transition);
        }
        .seat-handle { position: absolute; width: 80%; height: 6px; top: -6px; left: 10%; border: 2px solid #3e3e52; border-bottom: none; border-radius: 2px 2px 0 0; }
        .seat:hover { border-color: var(--primary); }
        .seat.booked { border-color: #eee; background: #eee; cursor: not-allowed; }
        .seat.booked .seat-handle { border-color: #eee; }
        .seat.selected { border-color: var(--accent); background: var(--accent); }
        .seat.selected .seat-handle { border-color: var(--accent); }
        .seat.quick-ticket { border-color: #f59e0b; }
        .seat.quick-ticket .seat-handle { border-color: #f59e0b; }
        .quick-badge { position: absolute; font-size: 10px; bottom: -2px; right: -2px; background: #f59e0b; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid white; }
        .aisle { width: 20px; }

        .seat-legend { display: flex; justify-content: center; gap: 20px; margin-top: 3rem; font-size: 0.85rem; color: var(--text-muted); }
        .legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-item .seat { width: 20px; height: 20px; transform: scale(0.8); }

        /* Form Styling */
        .details-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main); }
        .form-group input, .form-group select { width: 100%; padding: 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none; }
        .form-group input:focus { border-color: var(--primary); }

        .payment-cards { display: flex; flex-direction: column; gap: 10px; margin-top: 1rem; }
        .p-card { border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; }
        .p-card.active { border-color: var(--primary); background: #fff3f3; color: var(--primary); }
        .p-amount { font-size: 1.2rem; font-weight: 800; margin-top: 5px; }

        /* Sidebar Styling */
        .fare-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-main); }
        .fare-total { display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed #eee; font-size: 1.25rem; font-weight: 800; color: var(--secondary); }
        .booking-info { display: flex; gap: 10px; margin: 2rem 0; color: var(--text-muted); font-size: 0.75rem; line-height: 1.4; }
        .full-width { width: 100%; }

        .success-view { text-align: center; padding: 2rem 0; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .ticket-summary { width: 100%; background: #f9fafb; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; text-align: left; }
        .ticket-summary .row { display: flex; justify-content: space-between; margin-bottom: 0.8rem; }
        
        @media (max-width: 768px) {
          .booking-page { padding: 0.5rem 0; overflow-x: hidden; }
          .nav-container { padding: 0 10px !important; width: 100%; }
          
          .booking-stepper { 
            flex-direction: row; 
            justify-content: space-around; 
            gap: 5px; 
            margin-bottom: 1.5rem;
            padding: 0;
            width: 100%;
          }
          .booking-stepper .step { font-size: 0.65rem; flex-direction: column; gap: 4px; text-align: center; }
          .booking-stepper .step span { margin: 0 auto; }
          .booking-stepper svg { display: none; }
          
          .booking-layout { display: block; width: 100%; padding: 0; }
          .card { 
            padding: 1rem 0.5rem; 
            border-radius: 0; 
            border-left: none; 
            border-right: none; 
            width: 100%;
            margin: 0;
            box-shadow: none;
          }
          
          .role-notice { 
            margin: 0 10px 1rem !important; 
            font-size: 0.8rem;
            padding: 10px;
          }

          .seat-map-container { 
            transform: none; 
            width: 100%;
            max-width: 260px;
            padding: 20px 10px; 
            margin: 0 auto 2rem;
            display: block;
          }
          .seat { width: 32px; height: 32px; }
          .seat-row { gap: 10px; }
          .seat-legend { flex-wrap: wrap; gap: 10px; margin-top: 1.5rem; justify-content: center; font-size: 0.75rem; }
          
          .booking-sidebar { margin-top: 1.5rem; padding: 0 10px; }
          .form-row { grid-template-columns: 1fr; gap: 1rem; }
        }

        @media (max-width: 480px) {
          .booking-stepper .step { font-size: 0.6rem; }
          .seat-map-container { max-width: 240px; }
          .seat { width: 28px; height: 28px; }
          .seat-row { gap: 8px; }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
