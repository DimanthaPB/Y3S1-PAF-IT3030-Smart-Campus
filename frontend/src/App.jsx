import { useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Navigation/Footer';
import Navbar from './components/Navigation/Navbar';
import TechTicketList from './components/Ticket/TechTicketList';
import TicketList from './components/Ticket/TicketList';
import AdminBookings from './pages/AdminBookings';
import Bookings from './pages/Bookings';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import Preferences from './pages/Preferences';
import Resources from './pages/Resources';
import UserResources from './pages/UserResources';
import Login from './pages/auth/Login';
import Home from './pages/Home';
import AboutUs from './pages/info/AboutUs';
import ContactUs from './pages/info/ContactUs';
import FAQ from './pages/info/FAQ';
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsOfService from './pages/info/TermsOfService';
import { getCurrentUserRole } from './utils/auth';
import { getStoredToken } from './utils/api';

import './styles/design-system.css';

function RoleRoute({ children, adminOnly = false, userOnly = false }) {
  const token = getStoredToken();
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
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  const triggerTicketRefresh = () => {
    setTicketRefreshKey((current) => current + 1);
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/preferences" element={<Preferences />} />

            <Route
              path="/bookings"
              element={(
                <RoleRoute userOnly>
                  <Bookings />
                </RoleRoute>
              )}
            />
            <Route
              path="/admin/bookings"
              element={(
                <RoleRoute adminOnly>
                  <AdminBookings />
                </RoleRoute>
              )}
            />
            <Route
              path="/catalogue"
              element={(
                <RoleRoute userOnly>
                  <UserResources />
                </RoleRoute>
              )}
            />
            <Route
              path="/resources"
              element={(
                <RoleRoute adminOnly>
                  <Resources />
                </RoleRoute>
              )}
            />
            <Route path="/tickets" element={<TicketList refreshKey={ticketRefreshKey} />} />
            <Route
              path="/tech/tickets"
              element={(
                <TechTicketList
                  refreshKey={ticketRefreshKey}
                  onTicketRefresh={triggerTicketRefresh}
                />
              )}
            />

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
