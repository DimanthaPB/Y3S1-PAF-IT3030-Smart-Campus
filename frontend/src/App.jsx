import { useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Navigation/Footer';
import Navbar from './components/Navigation/Navbar';
import TechTicketList from './components/Ticket/TechTicketList';
import TicketList from './components/Ticket/TicketList';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
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

function RoleRoute({ children, allowedRoles = [] }) {
  const token = getStoredToken();
  const currentRole = getCurrentUserRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'ADMIN') {
      return <Navigate to="/admin/bookings" replace />;
    }
    return <Navigate to="/bookings" replace />;
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

            <Route
              path="/bookings"
              element={(
                <RoleRoute allowedRoles={['USER']}>
                  <Bookings />
                </RoleRoute>
              )}
            />
            <Route
              path="/admin/bookings"
              element={(
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </RoleRoute>
              )}
            />
            <Route
              path="/catalogue"
              element={(
                <RoleRoute allowedRoles={['USER']}>
                  <UserResources />
                </RoleRoute>
              )}
            />
            <Route
              path="/resources"
              element={(
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Resources />
                </RoleRoute>
              )}
            />
            <Route
              path="/admin/users"
              element={(
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </RoleRoute>
              )}
            />
            <Route
              path="/preferences"
              element={(
                <RoleRoute allowedRoles={['USER', 'ADMIN', 'MANAGER']}>
                  <Preferences />
                </RoleRoute>
              )}
            />
            <Route
              path="/tickets"
              element={(
                <RoleRoute allowedRoles={['USER']}>
                  <TicketList refreshKey={ticketRefreshKey} />
                </RoleRoute>
              )}
            />
            <Route
              path="/tech/tickets"
              element={(
                <RoleRoute allowedRoles={['ADMIN']}>
                  <TechTicketList
                    refreshKey={ticketRefreshKey}
                    onTicketRefresh={triggerTicketRefresh}
                  />
                </RoleRoute>
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
