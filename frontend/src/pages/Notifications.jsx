import React from 'react';
import { Bell, Settings2 } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="page-container animate-fade-in">
      <div className="glass-panel prefs-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Bell size={24} />
          <h2 style={{ margin: 0 }}>Notifications</h2>
        </div>
        <p className="prefs-subtitle">
          Notifications are now available from the bell icon in the top navigation bar.
        </p>
        <div className="pref-item">
          <div className="pref-info">
            <h4>Inbox access</h4>
            <p>Open the notification bell to view unread updates, mark alerts as read, or delete them.</p>
          </div>
          <Bell size={18} />
        </div>
        <div className="pref-item">
          <div className="pref-info">
            <h4>Preference controls</h4>
            <p>Use the Preferences page or the bell panel settings tab to manage booking, ticket, and system alerts.</p>
          </div>
          <Settings2 size={18} />
        </div>
      </div>
    </div>
  );
}
