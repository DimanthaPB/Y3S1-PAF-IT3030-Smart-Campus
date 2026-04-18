import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Info, LogOut, Menu, User, X } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import { isAdminUser } from '../../utils/auth';
import { clearStoredToken, getStoredToken } from '../../utils/api';
import './Navbar.css';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQs' },
];

const Navbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef();
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('jwt_token'));
    setIsAdmin(isAdminUser());
    setIsAuthenticated(!!getStoredToken());
    setMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location]);

  const navigationLinks = useMemo(() => {
    if (isAuthenticated) {
      return [
        ...publicLinks,
        { to: '/privacy', label: 'Privacy' },
      ];
    }

    return publicLinks;
  }, [isAuthenticated]);

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.href = '/';
  };

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
    <header className="navbar-shell">
      <nav className="glass-panel navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            SmartCampus<span className="hub">Hub</span>
          </Link>
          <span className="brand-badge">
            <Info size={14} />
            Operations Hub
          </span>
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

          {/* ✅ ADD THIS */}
        {isAuthenticated && isAdmin && <Link to="/resources">Resources</Link>}
        {isAuthenticated && !isAdmin && <Link to="/bookings">My Bookings</Link>}
        {isAuthenticated && isAdmin && <Link to="/admin/bookings">Admin Bookings</Link
      </div>
        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navigationLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="notification-wrapper" ref={notifRef}>
                <button
                  className={`icon-btn ${isNotifOpen ? 'active' : ''}`}
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                  title="Notifications"
                  type="button"
                >
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

              <button className="icon-btn" title="Profile" type="button">
                <User size={20} />
              </button>
              <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout" type="button">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary nav-signin-btn">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
