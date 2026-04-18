import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navigation/Navbar';
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
import TicketList from "./components/Ticket/TicketList";
import TechTicketList from "./components/Ticket/TechTicketList";
import Login from './pages/auth/Login';

import './styles/design-system.css';

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
            <Route path="/resources" element={<Resources />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            
            {/* Informational Pages */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route
              path="/tickets"
              element={<TicketList refreshKey={ticketRefreshKey} />}
            />
            <Route
              path="/tech/tickets"
              element={
                <TechTicketList
                  refreshKey={ticketRefreshKey}
                  onTicketRefresh={triggerTicketRefresh}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
