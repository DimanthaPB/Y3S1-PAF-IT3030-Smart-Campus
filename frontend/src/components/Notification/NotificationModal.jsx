import React, { useState, useEffect } from 'react';
import { Check, Trash2, X, BellOff } from 'lucide-react';
import api from '../../utils/api';
import './NotificationModal.css';

const NotificationModal = ({ onClose, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/users/me/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/users/me/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/users/me/notifications/${id}`);
      setNotifications(prev => {
        const targeting = prev.find(n => n.id === id);
        if (targeting && !targeting.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="glass-panel notif-modal animate-fade-in">
      <div className="notif-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}><X size={18} /></button>
      </div>
      
      <div className="notif-body">
        {loading ? (
          <div className="notif-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={32} opacity={0.5} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`notif-item ${notif.read ? 'read' : 'unread'}`}>
              <div className="notif-content">
                <span className="notif-type">{notif.type}</span>
                <p>{notif.message}</p>
                <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="notif-actions">
                {!notif.read && (
                  <button onClick={() => markAsRead(notif.id)} title="Mark as read">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)} title="Delete" className="notif-del">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
