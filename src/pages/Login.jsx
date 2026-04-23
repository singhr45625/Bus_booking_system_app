import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success('Welcome back!');
      
      if (loggedUser.role === 'operator') {
        navigate('/operator/dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><span className="spinner-sm"></span> LOGGING IN...</> : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
