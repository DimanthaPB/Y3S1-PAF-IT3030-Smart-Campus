import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import './Navbar.css';

const Navbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notifRef = useRef();
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('jwt_token'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Close notification modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="glass-panel navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">SmartCampus<span className="hub">Hub</span></Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {isAuthenticated && <Link to="/preferences">Preferences</Link>}
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="notification-wrapper" ref={notifRef}>
              <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              {isNotifOpen && (
                <NotificationModal 
                  onClose={() => setIsNotifOpen(false)} 
                  setUnreadCount={setUnreadCount} 
                />
              )}
            </div>
            
            <button className="icon-btn" title="Profile">
              <User size={20} />
            </button>
            <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <a href="http://localhost:8080/oauth2/authorization/google" className="btn-primary">
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
