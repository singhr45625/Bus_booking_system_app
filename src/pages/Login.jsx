import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await login(email, password);
      console.log('Login successful:', loggedUser);
      
      if (loggedUser.role === 'operator') {
        console.log('Navigating to operator dashboard...');
        navigate('/operator/dashboard');
      } else if (loggedUser.role === 'admin') {
        console.log('Navigating to admin dashboard...');
        navigate('/admin/dashboard');
      } else {
        console.log('Navigating to home...');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
