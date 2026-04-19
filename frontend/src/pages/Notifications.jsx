/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');

  const API_URL = 'http://localhost:8080/api/notifications';
  const navigate = useNavigate();

  const fetchNotifications = async (userEmail) => {
    try {
      const response = await axios.get(`${API_URL}?email=${userEmail}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const checkUserLogin = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/success');
      if (response.data && response.data.email) {
        setEmail(response.data.email);
        setUserName(response.data.name);
        fetchNotifications(response.data.email);
      } else {
        navigate('/');
      }
    } catch {
      console.error('User not logged in');
      navigate('/');
    }
  };

  useEffect(() => {
    checkUserLogin();
  }, []);

  const addNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        recipientEmail: email,
        title,
        message,
      });
      setTitle('');
      setMessage('');
      fetchNotifications(email);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`);
      fetchNotifications(email);
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchNotifications(email);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ backgroundColor: '#e6f7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Hello, {userName}!</h2>
        <p style={{ margin: '5px 0 0 0', color: 'gray' }}>Logged in as: {email}</p>
      </div>

      <form onSubmit={addNotification} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Send New Notification</h3>
        <input
          type="text"
          placeholder="Title"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%', maxWidth: '400px' }}
        />
        <textarea
          placeholder="Message"
          value={message}
          required
          onChange={(e) => setMessage(e.target.value)}
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%', maxWidth: '400px', height: '80px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Send Notification
        </button>
      </form>

      <h3>Your Notifications</h3>
      {notifications.length === 0 ? <p>No notifications found.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((notif) => (
            <li
              key={notif.id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: notif.read ? '#f9f9f9' : '#ffffff',
                borderLeft: notif.read ? '5px solid #ccc' : '5px solid #2196F3',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0' }}>
                {notif.title}
                {!notif.read && <span style={{ color: 'red', fontSize: '12px', marginLeft: '10px' }}>NEW</span>}
              </h4>
              <p>{notif.message}</p>

              {!notif.read && (
                <button onClick={() => markAsRead(notif.id)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                  Mark as Read
                </button>
              )}
              <button onClick={() => deleteNotification(notif.id)} style={{ backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
