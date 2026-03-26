import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(username, email, password, role, companyName);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <select value={role} onChange={(e) => setRole(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <option value="user">User</option>
          <option value="operator">Operator</option>
          <option value="admin">Admin (For Testing)</option>
        </select>

        {role === 'operator' && (
          <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        )}

        <button type="submit" className="btn-primary">Sign Up</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
      </p>
    </div>
  );
};

export default Signup;
