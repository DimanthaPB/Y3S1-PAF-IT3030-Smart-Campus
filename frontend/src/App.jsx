import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navigation/RoleAwareNavbar';
import Footer from './components/Navigation/Footer';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Preferences from './pages/Preferences';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import AboutUs from './pages/info/AboutUs';
import ContactUs from './pages/info/ContactUs';
import FAQ from './pages/info/FAQ';
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsOfService from './pages/info/TermsOfService';
import Bookings from './pages/Bookings';
import AdminBookings from './pages/AdminBookings';
import { getCurrentUserRole } from './utils/auth';

import './styles/design-system.css';

function RoleRoute({ children, adminOnly = false, userOnly = false }) {
  const token = localStorage.getItem('jwt_token');
  const isAdmin = getCurrentUserRole() === 'ADMIN';

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/admin/bookings" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route
              path="/bookings"
              element={
                <RoleRoute userOnly>
                  <Bookings />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RoleRoute adminOnly>
                  <AdminBookings />
                </RoleRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <RoleRoute adminOnly>
                  <Resources />
                </RoleRoute>
              }
            />
            {/* Informational Pages */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
