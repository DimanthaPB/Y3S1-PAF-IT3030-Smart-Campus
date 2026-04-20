import React, { useCallback, useEffect, useState } from 'react';
import { BellOff, Check, Settings2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getCurrentUserRole } from '../../utils/auth';
import './NotificationModal.css';

const defaultPrefs = {
  receiveBookingAlerts: true,
  receiveTicketAlerts: true,
  receiveSystemAlerts: true,
};

const preferenceItems = [
  {
    key: 'receiveBookingAlerts',
    title: 'Booking alerts',
    description: 'Receive updates about approvals, rejections, and booking changes.',
  },
  {
    key: 'receiveTicketAlerts',
    title: 'Ticket alerts',
    description: 'Stay informed about incident progress, assignment changes, and resolutions.',
  },
  {
    key: 'receiveSystemAlerts',
    title: 'System alerts',
    description: 'Receive important platform notices and campus-wide operational updates.',
  },
];

const NotificationModal = ({
  notifications: initialNotifications = [],
  onClose,
  refreshNotifications,
  setNotifications: setParentNotifications,
  setUnreadCount,
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [loading, setLoading] = useState(initialNotifications.length === 0);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const currentRole = getCurrentUserRole();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/notifications');
      setNotifications(data);
      setParentNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [setParentNotifications, setUnreadCount]);

  const fetchPrefs = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/preferences');
      setPrefs({
        receiveBookingAlerts: data.receiveBookingAlerts,
        receiveTicketAlerts: data.receiveTicketAlerts,
        receiveSystemAlerts: data.receiveSystemAlerts,
      });
    } catch (err) {
      console.error('Failed to fetch preferences', err);
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifications(initialNotifications);
      setLoading(false);
    } else {
      fetchNotifications();
    }

    fetchPrefs();
  }, [fetchNotifications, fetchPrefs, initialNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/users/me/notifications/${id}/read`);
      const nextNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setNotifications(nextNotifications);
      setParentNotifications(nextNotifications);
      setUnreadCount(nextNotifications.filter((n) => !n.read).length);
      return nextNotifications;
    } catch (error) {
      console.error('Failed to mark read', error);
      return null;
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/users/me/notifications/${id}`);
      const nextNotifications = notifications.filter((n) => n.id !== id);
      setNotifications(nextNotifications);
      setParentNotifications(nextNotifications);
      setUnreadCount(nextNotifications.filter((n) => !n.read).length);
      refreshNotifications?.();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePrefs = async () => {
    try {
      setSavingPrefs(true);
      setStatusMessage('');
      await api.put('/users/me/preferences', prefs);
      setStatusMessage('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences', error);
      setStatusMessage('Unable to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const getNotificationTarget = (notification) => {
    if (notification.type === 'BOOKING') {
      return currentRole === 'ADMIN' ? '/admin/bookings' : '/bookings';
    }

    if (notification.type === 'TICKET') {
      return currentRole === 'ADMIN' ? '/tech/tickets' : '/tickets';
    }

    if (notification.type === 'SYSTEM') {
      return currentRole === 'ADMIN' ? '/resources' : '/catalogue';
    }

    return '/preferences';
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    refreshNotifications?.();
    onClose();
    navigate(getNotificationTarget(notification));
  };

  return (
    <div className="notif-modal animate-fade-in">
      <div className="notif-header">
        <div>
          <h3>Notifications</h3>
          <p>Updates and alert settings in one place</p>
        </div>
        <button className="close-btn" onClick={onClose} type="button">
          <X size={18} />
        </button>
      </div>

      <div className="notif-tabs">
        <button
          type="button"
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Inbox
        </button>
        <button
          type="button"
          className={activeTab === 'preferences' ? 'active' : ''}
          onClick={() => setActiveTab('preferences')}
        >
          <Settings2 size={15} />
          Preferences
        </button>
      </div>

      <div className="notif-body">
        {activeTab === 'notifications' ? (
          loading ? (
            <div className="notif-empty">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <BellOff size={32} opacity={0.55} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notif)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleNotificationClick(notif);
                  }
                }}
                role="button"
                tabIndex={0}
                title="Open related page"
              >
                <div className="notif-content">
                  <span className="notif-type">{notif.type}</span>
                  <p>{notif.message}</p>
                  <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="notif-actions">
                  {!notif.read && (
                    <button
                      onClick={async (event) => {
                        event.stopPropagation();
                        await markAsRead(notif.id);
                        refreshNotifications?.();
                      }}
                      title="Mark as read"
                      type="button"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Delete"
                    className="notif-del"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : prefsLoading ? (
          <div className="notif-empty">Loading preferences...</div>
        ) : (
          <div className="notif-preferences">
            {preferenceItems.map((item) => (
              <div key={item.key} className="notif-pref-item">
                <div className="notif-pref-copy">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}

            <div className="notif-pref-footer">
              <span className={`notif-status ${statusMessage ? 'visible' : ''}`}>{statusMessage}</span>
              <button className="btn-primary notif-save-btn" onClick={savePrefs} disabled={savingPrefs} type="button">
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
