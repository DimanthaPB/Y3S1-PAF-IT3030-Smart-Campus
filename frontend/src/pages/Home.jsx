import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminUser } from '../utils/auth';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isAdmin = isAdminUser();

  const featureCards = useMemo(() => {
    if (isAdmin) {
      return [
        {
          title: 'Manage Bookings',
          description:
            'Review pending requests, filter the queue, and act on approvals, rejections, or cancellations.',
          iconClass: 'icon-blue',
          onClick: () => navigate('/admin/bookings'),
        },
        {
          title: 'Manage Resources',
          description:
            'Update facility availability, adjust capacities, and keep bookable resources ready for users.',
          iconClass: 'icon-green',
          onClick: () => navigate('/resources'),
        },
        {
          title: 'Incident Management',
          description:
            'Report and track maintenance issues with real-time updates and notifications.',
          iconClass: 'icon-purple',
        },
      ];
    }

    return [
      {
        title: 'My Bookings',
        description:
          'Create and track your room, lab, and equipment requests from one clean booking workspace.',
        iconClass: 'icon-blue',
        onClick: () => navigate('/bookings'),
      },
      {
        title: 'Preferences',
        description:
          'Customize your account experience, notification settings, and personal workspace preferences.',
        iconClass: 'icon-green',
        onClick: () => navigate('/preferences'),
      },
      {
        title: 'Real-time Alerts',
        description:
          'Stay informed with our global notification system for all your campus activities.',
        iconClass: 'icon-purple',
      },
    ];
  }, [isAdmin, navigate]);

  return (
    <div className="home-container">
      <div className="hero-section animate-fade-in">
        <div className="hero-copy">
          <div className="hero-kicker">
            {isAdmin ? 'Admin Workspace' : 'User Workspace'}
          </div>
        <h1 className="hero-title">
          Welcome to <span className="highlight">SmartCampus Hub</span>
        </h1>
        <p className="hero-subtitle">
          {isAdmin
            ? 'The central control point for booking operations, resource oversight, and fast campus coordination.'
            : 'The central platform for managing your facility bookings, equipment access, and campus updates with state-of-the-art efficiency.'}
        </p>
        </div>
        
        <div className="features-grid">
          {featureCards.map((card) => {
            const sharedContent = (
              <>
                <div className={`feature-icon ${card.iconClass}`}></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </>
            );

            if (card.onClick) {
              return (
                <button
                  key={card.title}
                  type="button"
                  className="glass-panel feature-card feature-card-button"
                  onClick={card.onClick}
                >
                  {sharedContent}
                </button>
              );
            }

            return (
              <div key={card.title} className="glass-panel feature-card">
                {sharedContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
