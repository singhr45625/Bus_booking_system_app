import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Plus, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const WalletModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/users/wallet/add', { amount: Number(amount) }, config);
      setUser({ ...user, walletBalance: data.balance });
      setAmount('');
      alert('Money added successfully!');
    } catch (err) {
      console.error('Wallet Error:', err);
      alert('Error adding money');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade">
      <div className="wallet-modal animate-slide">
        <div className="modal-header">
          <h3>My Wallet</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div className="balance-card">
          <span>Available Balance</span>
          <h2>₹{user?.walletBalance?.toLocaleString() || '0'}</h2>
          <div className="card-chip"></div>
        </div>

        <form onSubmit={handleAddMoney} className="add-money-form">
          <div className="input-group">
            <span className="currency">₹</span>
            <input 
              type="number" 
              placeholder="Enter amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="add-money-btn" disabled={loading}>
            {loading ? 'Processing...' : <><Plus size={18} /> Add Money</>}
          </button>
        </form>

        <div className="transactions">
          <div className="trans-header">
            <h4>Recent Transactions</h4>
            <Clock size={16} />
          </div>
          <div className="trans-list">
            <div className="trans-item">
              <div className="icon-box credit"><ArrowDownLeft size={18} /></div>
              <div className="details">
                <h5>Wallet Refill</h5>
                <span>12 Apr, 2026</span>
              </div>
              <div className="amount credit">+₹500</div>
            </div>
            <div className="trans-item">
              <div className="icon-box debit"><ArrowUpRight size={18} /></div>
              <div className="details">
                <h5>Bus Booking #BK782</h5>
                <span>10 Apr, 2026</span>
              </div>
              <div className="amount debit">-₹250</div>
            </div>
          </div>
          <button className="view-all-btn">View Full Statement</button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
