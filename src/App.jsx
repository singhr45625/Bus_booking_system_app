import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import BusSearchResults from './pages/BusSearchResults';
import BookingPage from './pages/BookingPage';
import Profile from './pages/Profile';
import LiveTracking from './pages/LiveTracking';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="gradient-bg"></div>
        <Navbar />
        <main>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<BusSearchResults />} />
              <Route path="/booking/:busId" element={<BookingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tracking/:bookingId" element={<LiveTracking />} />
              <Route path="/track/:bookingId" element={<LiveTracking />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/management" element={<AdminManagement />} />
              
              {/* Operator Routes */}
              <Route path="/operator/dashboard" element={<OperatorDashboard />} />
              <Route path="/operator/buses" element={<OperatorBuses />} />
              <Route path="/operator/boarding" element={<OperatorBoarding />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
