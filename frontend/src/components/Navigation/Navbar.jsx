import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Info, LogOut, Menu, User, X } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import { isAdminUser } from '../../utils/auth';
import { clearStoredToken, getStoredToken } from '../../utils/api';
import './Navbar.css';

const publicLinks = [
  { to: '/', label: 'Home' },
];

const Navbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();

  const isAuthenticated = !!getStoredToken();
  const isAdmin = isAuthenticated && isAdminUser();

  const navigationLinks = useMemo(() => {
    const links = [...publicLinks];

    if (isAuthenticated) {
      if (isAdmin) {
        links.push({ to: '/admin/bookings', label: 'Admin Bookings' });
        links.push({ to: '/resources', label: 'Resources' });
      } else {
        links.push({ to: '/bookings', label: 'My Bookings' });
        links.push({ to: '/catalogue', label: 'Catalogue' });
      }
    }

    return links;
  }, [isAdmin, isAuthenticated]);

  const handleLogout = () => {
    clearStoredToken();
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
