import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock } from 'lucide-react';

const MockPaymentModal = ({ isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;

    setIsProcessing(true);
    // Simulate real gateway processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    await onConfirm(amount);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div className="payment-modal card animate-fade" style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: '#eef2ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#4f46e5' }}>
            <CreditCard size={32} />
          </div>
          <h2 style={{ margin: 0 }}>Add Credits</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Secure Mock Payment Gateway</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>Amount to Add (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 1000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee', fontSize: '1.2rem', fontWeight: '700', outline: 'none' }}
              autoFocus
            />
          </div>

          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
              <Lock size={14} /> <span>Card Details (Mock)</span>
            </div>
            <input type="text" placeholder="4444 4444 4444 4444" disabled style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.9rem' }} />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#15904f', color: 'white', border: 'none', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>PAY ₹{amount || '0'}</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15904f', fontSize: '0.75rem', fontWeight: '700' }}>
          <ShieldCheck size={16} /> 256-BIT SSL SECURE PAYMENT
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
