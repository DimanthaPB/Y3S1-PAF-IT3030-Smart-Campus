import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Info, LogOut, Menu, Settings, User, X } from 'lucide-react';
import NotificationModal from '../Notification/NotificationModal';
import { getCurrentUserEmail, getCurrentUserRole } from '../../utils/auth';
import api, { clearStoredToken, getStoredToken } from '../../utils/api';
import './Navbar.css';

const publicLinks = [
  { to: '/', label: 'Home' },
];

const Navbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAvatarBroken, setIsAvatarBroken] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  const isAuthenticated = !!getStoredToken();
  const currentRole = isAuthenticated ? getCurrentUserRole() : '';
  const currentEmail = isAuthenticated ? getCurrentUserEmail() : '';
  const isAdmin = currentRole === 'ADMIN';
  const isStandardUser = currentRole === 'USER';
  const displayName = profileData?.name?.trim() || currentEmail || 'Signed in user';
  const displayRole = profileData?.role || currentRole || 'Authenticated account';
  const displayAvatarUrl = profileData?.avatarUrl?.trim() || '';
  const shouldShowAvatarImage = Boolean(displayAvatarUrl) && !isAvatarBroken;
  const profileInitial = (displayName.charAt(0) || currentRole.charAt(0) || 'U').toUpperCase();

  const navigationLinks = useMemo(() => {
    const links = [...publicLinks];

    if (isAuthenticated) {
      if (isAdmin) {
        links.push({ to: '/admin/bookings', label: 'Bookings' });
        links.push({ to: '/resources', label: 'Resources' });
        links.push({ to: '/tech/tickets', label: 'Tickets' });
        links.push({ to: '/admin/users', label: 'Users' });
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

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfileData(null);
      return;
    }

    try {
      const { data } = await api.get('/users/me');
      setProfileData(data);
      setIsAvatarBroken(false);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setProfileData(null);
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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchProfile();
    setIsNotifOpen(false);
    setIsProfileOpen(false);
    setMobileMenuOpen(false);
  }, [fetchNotifications, fetchProfile, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileData(null);
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
                  onClick={() => {
                    setIsNotifOpen((prev) => !prev);
                    setIsProfileOpen(false);
                  }}
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

              <div className="profile-wrapper" ref={profileRef}>
                <button
                  className={`icon-btn profile-btn ${isProfileOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsProfileOpen((prev) => !prev);
                    setIsNotifOpen(false);
                  }}
                  title="Profile"
                  type="button"
                >
                  {shouldShowAvatarImage ? (
                    <img
                      className="profile-image"
                      src={displayAvatarUrl}
                      alt={displayName}
                      onError={() => setIsAvatarBroken(true)}
                    />
                  ) : (
                    <span className="profile-initial">{profileInitial}</span>
                  )}
                </button>
                {isProfileOpen && (
                  <div className="profile-menu animate-fade-in">
                    <div className="profile-menu-header">
                      <div className="profile-avatar">
                        {shouldShowAvatarImage ? (
                          <img
                            className="profile-avatar-image"
                            src={displayAvatarUrl}
                            alt={displayName}
                            onError={() => setIsAvatarBroken(true)}
                          />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div className="profile-copy">
                        <strong>{displayName}</strong>
                        <span>{displayRole}</span>
                        <small>{profileData?.email || currentEmail || 'No email available'}</small>
                      </div>
                    </div>

                    <div className="profile-menu-links">
                      <Link to="/preferences" className="profile-menu-link">
                        <Settings size={16} />
                        Preferences
                      </Link>
                      <button className="profile-menu-link logout-link" onClick={handleLogout} type="button">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
