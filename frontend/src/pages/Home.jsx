import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleIncidentCardClick = () => {
    navigate('/tickets');
  };

  return (
    <div className="home-container">
      <div className="hero-section animate-fade-in">
        <h1 className="hero-title">
          Welcome to <span className="highlight">SmartCampus Hub</span>
        </h1>
        <p className="hero-subtitle">
          The central platform for managing facility bookings, equipment, and incident tracking with state-of-the-art efficiency.
        </p>
        
        <div className="features-grid">
          <div className="glass-panel feature-card">
            <div className="feature-icon icon-blue"></div>
            <h3>Resource Booking</h3>
            <p>Seamlessly reserve rooms, labs, and equipment with instant approval flows.</p>
          </div>
          
          <div
            className="glass-panel feature-card"
            role="button"
            tabIndex={0}
            onClick={handleIncidentCardClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleIncidentCardClick();
              }
            }}
            style={{ cursor: 'pointer' }}
            aria-label="Go to Incident Management tickets"
          >
            <div className="feature-icon icon-green"></div>
            <h3>Incident Management</h3>
            <p>Report and track maintenance issues with real-time updates and notifications.</p>
          </div>
          
          <div className="glass-panel feature-card">
            <div className="feature-icon icon-purple"></div>
            <h3>Real-time Alerts</h3>
            <p>Stay informed with our global notification system for all your campus activities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
