import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Info, LogOut, Menu, User, X } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import { getCurrentUserRole } from '../../utils/auth';
import api, { clearStoredToken, getStoredToken } from '../../utils/api';
import './Navbar.css';

const publicLinks = [
  { to: '/', label: 'Home' },
];

const Navbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();

  const isAuthenticated = !!getStoredToken();
  const currentRole = isAuthenticated ? getCurrentUserRole() : '';
  const isAdmin = currentRole === 'ADMIN';
  const isStandardUser = currentRole === 'USER';

  const navigationLinks = useMemo(() => {
    const links = [...publicLinks];

    if (isAuthenticated) {
      if (isAdmin) {
        links.push({ to: '/admin/bookings', label: 'Bookings' });
        links.push({ to: '/resources', label: 'Resources' });
        links.push({ to: '/tech/tickets', label: 'Tickets' });
      } else if (isStandardUser) {
        links.push({ to: '/bookings', label: 'My Bookings' });
        links.push({ to: '/catalogue', label: 'Catalogue' });
        links.push({ to: '/tickets', label: 'Tickets' });
      }
    }

    return links;
  }, [isAdmin, isAuthenticated, isStandardUser]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const { data } = await api.get('/users/me/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [isAuthenticated]);

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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(fetchNotifications, 15000);
    const handleWindowFocus = () => {
      fetchNotifications();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchNotifications, isAuthenticated]);

  return (
    <header className="navbar-shell">
      <nav className="glass-panel navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            SmartCampus<span className="hub">Hub</span>
          </Link>
          
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
                    notifications={notifications}
                    refreshNotifications={fetchNotifications}
                    onClose={() => setIsNotifOpen(false)}
                    setNotifications={setNotifications}
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
