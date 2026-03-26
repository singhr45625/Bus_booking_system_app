import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import OperatorDashboard from './pages/OperatorDashboard';
import OperatorBuses from './pages/OperatorBuses';
import OperatorBoarding from './pages/OperatorBoarding';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="gradient-bg"></div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/management" element={<AdminManagement />} />
            
            {/* Operator Routes */}
            <Route path="/operator/dashboard" element={<OperatorDashboard />} />
            <Route path="/operator/buses" element={<OperatorBuses />} />
            <Route path="/operator/boarding" element={<OperatorBoarding />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
