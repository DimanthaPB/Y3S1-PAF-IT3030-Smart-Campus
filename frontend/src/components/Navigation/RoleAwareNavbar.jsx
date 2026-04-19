import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import { isAdminUser } from '../../utils/auth';
import { clearStoredToken, getStoredToken } from '../../utils/api';
import './Navbar.css';

const RoleAwareNavbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const isAuthenticated = !!getStoredToken();
  const isAdmin = isAuthenticated && isAdminUser();

  const handleLogout = () => {
    clearStoredToken();
    window.location.href = '/';
  };

  return (
    <nav className="glass-panel navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          SmartCampus<span className="hub">Hub</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {isAuthenticated && isAdmin && <Link to="/admin/bookings">Manage Bookings</Link>}
        {isAuthenticated && isAdmin && <Link to="/resources">Manage Resources</Link>}
        {isAuthenticated && !isAdmin && <Link to="/bookings">My Bookings</Link>}
        {isAuthenticated && !isAdmin && <Link to="/catalogue">Resource Catalogue</Link>}
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <div className="notification-wrapper" ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => setIsNotifOpen((prev) => !prev)}
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
            <button
              className="icon-btn logout-btn"
              onClick={handleLogout}
              title="Logout"
              type="button"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default RoleAwareNavbar;
