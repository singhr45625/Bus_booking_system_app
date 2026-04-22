import React from 'react';
import { Bus, User, Calendar, MapPin, Ticket as TicketIcon, Clock } from 'lucide-react';

const TicketTemplate = ({ booking, id }) => {
  if (!booking || !booking.bus) return null;

  return (
    <div id={id} style={{ 
      width: '600px', 
      padding: '40px', 
      background: 'white', 
      fontFamily: "'Inter', sans-serif",
      color: '#333'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#15904f', color: 'white', padding: '10px', borderRadius: '12px' }}>
            <Bus size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>SmartBus</h2>
            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>Official E-Ticket</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: '700', marginBottom: '4px' }}>BOOKING ID</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#111' }}>#SB-{booking._id?.slice(-8).toUpperCase()}</div>
        </div>
      </div>

      {/* Main Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15904f', marginBottom: '8px' }}>
            <MapPin size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>JOURNEY DETAILS</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.bus.source} ➔ {booking.bus.destination}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>{booking.bus.name} ({booking.bus.busType || 'Luxury AC'})</p>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15904f', marginBottom: '8px' }}>
            <Calendar size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>DATE & TIME</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.bus.date}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}><Clock size={14} /> Departs at {booking.bus.departureTime}</p>
        </div>
      </div>

      {/* Passenger Info */}
      <div style={{ background: '#f8f9fa', borderRadius: '20px', padding: '25px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#aaa', marginBottom: '5px' }}>PASSENGER</label>
            <div style={{ fontWeight: '700' }}>{booking.passengerDetails?.name || 'N/A'}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#aaa', marginBottom: '5px' }}>SEAT NUMBERS</label>
            <div style={{ fontWeight: '900', color: '#15904f' }}>{booking.seatNumbers?.join(', ')}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#aaa', marginBottom: '5px' }}>STATUS</label>
            <div style={{ fontWeight: '700', color: booking.status === 'Confirmed' ? '#15904f' : '#b45309' }}>{booking.status?.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div style={{ borderTop: '2px dashed #eee', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Fare Paid</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>₹{booking.paidAmount?.toLocaleString()}</div>
          </div>
          {booking.remainingBalance > 0 && (
            <div style={{ textAlign: 'right', background: '#fffbeb', padding: '10px 15px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
              <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '700' }}>BALANCE DUE</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#b45309' }}>₹{booking.remainingBalance?.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Instructions */}
      <div style={{ marginTop: '40px', fontSize: '0.7rem', color: '#999', lineHeight: '1.5', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
        <p><strong>Instructions:</strong> Please reach the boarding point 15 minutes before departure. Carry a valid photo ID. This is a computer-generated ticket and does not require a signature.</p>
        <p style={{ textAlign: 'center', marginTop: '20px', fontWeight: '700' }}>Wishing you a happy and safe journey with SmartBus!</p>
      </div>
    </div>
  );
};

export default TicketTemplate;
