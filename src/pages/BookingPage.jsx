import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, Phone, Mail, CreditCard, ChevronRight, CheckCircle, Info } from 'lucide-react';
import './Home.css';

const BookingPage = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1); // 1: Seats, 2: Details, 3: Payment
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

  const [isProcessing, setIsProcessing] = useState(false);

  const handleBooking = async () => {
    // Validation
    if (!passengerInfo.name || !passengerInfo.age || !passengerInfo.phone || !passengerInfo.email) {
      alert('Please fill in all passenger details');
      return;
    }

    setIsProcessing(true);
    try {
      // Mock Payment Process Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/bookings', { 
        busId, 
        seatNumbers: selectedSeats,
        passengerDetails: passengerInfo
      }, config);
      setStep(3); // Success
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner"></div></div>;
  if (!bus) return <div className="error-state">Bus not found</div>;

  const totalFare = selectedSeats.length * (Number(bus.price) || 0);

  return (
    <div className="booking-page animate-fade">
      <div className="nav-container">
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
                              className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleSeat(seatId)}
                              title={isBooked ? 'Booked' : `Seat ${seatId} - ₹${bus.price}`}
                            >
                              <div className="seat-handle"></div>
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
                      onChange={e => setPassengerInfo({...passengerInfo, name: e.target.value})}
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
                        onChange={e => setPassengerInfo({...passengerInfo, age: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select 
                        value={passengerInfo.gender} 
                        onChange={e => setPassengerInfo({...passengerInfo, gender: e.target.value})}
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
                      onChange={e => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label><Mail size={16} /> Email Address</label>
                    <input 
                      type="email" 
                      placeholder="ticket@example.com" 
                      value={passengerInfo.email} 
                      onChange={e => setPassengerInfo({...passengerInfo, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="payment-mock">
                  <h3><CreditCard size={18} /> Payment Options</h3>
                  <div className="payment-cards">
                    <div className="p-card active">Credit/Debit Card</div>
                    <div className="p-card">UPI / GPay</div>
                    <div className="p-card">Net Banking</div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="success-view animate-fade">
                <CheckCircle size={80} color="#15904f" />
                <h2>Booking Successful!</h2>
                <p>Your ticket has been sent to your email and WhatsApp.</p>
                <div className="ticket-summary">
                  <div className="row"><span>Booking ID:</span> <strong>#RB{Math.floor(Math.random()*100000)}</strong></div>
                  <div className="row"><span>Bus:</span> <strong>{bus.name}</strong></div>
                  <div className="row"><span>Seats:</span> <strong>{selectedSeats.join(', ')}</strong></div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/my-bookings')}>VIEW MY BOOKINGS</button>
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
                  <span>Total Amount</span>
                  <span>₹{selectedSeats.length > 0 ? totalFare + 25 : 0}</span>
                </div>
                
                <div className="booking-info">
                  <Info size={16} />
                  <p>By clicking proceed/pay, you agree to the terms and privacy policy.</p>
                </div>

                {step === 1 ? (
                  <button 
                    className="btn-primary full-width" 
                    disabled={selectedSeats.length === 0}
                    onClick={() => setStep(2)}
                  >
                    PROCEED TO DETAILS
                  </button>
                ) : (
                  <button className="btn-primary full-width" onClick={handleBooking} disabled={isProcessing}>
                    {isProcessing ? 'PROCESSING...' : 'PAY & CONFIRM'}
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
        .p-card { border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: 0.2s; }
        .p-card.active { border-color: var(--primary); background: #fff3f3; color: var(--primary); }

        /* Sidebar Styling */
        .fare-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-main); }
        .fare-total { display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed #eee; font-size: 1.25rem; font-weight: 800; color: var(--secondary); }
        .booking-info { display: flex; gap: 10px; margin: 2rem 0; color: var(--text-muted); font-size: 0.75rem; line-height: 1.4; }
        .full-width { width: 100%; }

        .success-view { text-align: center; padding: 2rem 0; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .ticket-summary { width: 100%; background: #f9fafb; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; text-align: left; }
        .ticket-summary .row { display: flex; justify-content: space-between; margin-bottom: 0.8rem; }
        
        @media (max-width: 768px) {
          .booking-layout { grid-template-columns: 1fr; }
          .booking-stepper { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
