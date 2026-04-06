import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Preferences.css';

const Preferences = () => {
  const [prefs, setPrefs] = useState({
    receiveBookingAlerts: true,
    receiveTicketAlerts: true,
    receiveSystemAlerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const { data } = await api.get('/users/me/preferences');
      setPrefs({
        receiveBookingAlerts: data.receiveBookingAlerts,
        receiveTicketAlerts: data.receiveTicketAlerts,
        receiveSystemAlerts: data.receiveSystemAlerts
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePrefs = async () => {
    try {
      setSaving(true);
      await api.put('/users/me/preferences', prefs);
      alert('Preferences saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error(error);
      setSaving(false);
      alert('Failed to save preferences');
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="glass-panel prefs-panel">
        <h2>Notification Preferences</h2>
        <p className="prefs-subtitle">Customize what alerts you want to receive.</p>

        <div className="pref-item">
          <div className="pref-info">
            <h4>Booking Alerts</h4>
            <p>Get notified about your room and equipment bookings.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={prefs.receiveBookingAlerts} onChange={() => handleToggle('receiveBookingAlerts')} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="pref-item">
          <div className="pref-info">
            <h4>Ticket Alerts</h4>
            <p>Get notified about maintenance and incident tickets.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={prefs.receiveTicketAlerts} onChange={() => handleToggle('receiveTicketAlerts')} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="pref-item">
          <div className="pref-info">
            <h4>System Alerts</h4>
            <p>Important campus-wide announcements.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={prefs.receiveSystemAlerts} onChange={() => handleToggle('receiveSystemAlerts')} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="prefs-actions">
          <button className="btn-primary" onClick={savePrefs} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
