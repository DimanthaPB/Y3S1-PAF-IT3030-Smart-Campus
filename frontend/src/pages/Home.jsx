import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import './Home.css';

const stats = [
  { value: '05', label: 'Core modules' },
  { value: '24/7', label: 'Campus visibility' },
  { value: '03', label: 'User roles ready' },
  { value: '100%', label: 'Assignment aligned' },
];

const modules = [
  {
    icon: MapPinned,
    title: 'Facilities & Assets',
    description:
      'Maintain lecture halls, labs, meeting rooms, and equipment with metadata, status, and search filters.',
  },
  {
    icon: CalendarClock,
    title: 'Booking Workflow',
    description:
      'Handle requests, conflict checks, approvals, rejections, and cancellations through a structured lifecycle.',
  },
  {
    icon: Wrench,
    title: 'Incident Ticketing',
    description:
      'Capture faults with categories, priorities, evidence images, technician updates, and resolution notes.',
  },
  {
    icon: BellRing,
    title: 'Notifications',
    description:
      'Keep users informed when bookings change, tickets move stages, or new comments arrive in the system.',
  },
];

const highlights = [
  'OAuth 2.0 sign-in flow for secure campus access',
  'Role-aware experience for users, admins, and technical staff',
  'Real-time style notification center connected to key workflows',
];

const workflows = [
  {
    step: '01',
    title: 'Discover resources',
    description:
      'Users can search by type, capacity, location, and availability before making a request.',
  },
  {
    step: '02',
    title: 'Manage requests',
    description:
      'Bookings and incident reports move through clear statuses with accountability at every step.',
  },
  {
    step: '03',
    title: 'Stay updated',
    description:
      'Notifications, comments, and role-based actions help every stakeholder stay in sync.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleIncidentCardClick = () => {
    navigate('/tickets');
  };

  return (
    <div className="home-container">
      <section className="hero-section animate-fade-in">
        <div className="hero-shapes" aria-hidden="true">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="badge-pill">
            <Sparkles size={16} />
            Smart Campus Operations Hub
          </div>

          <h1 className="hero-title">
            One place to run <span className="highlight">campus operations</span> with clarity.
          </h1>

          <p className="hero-subtitle">
            SmartCampus Hub brings together facility booking, asset visibility, maintenance ticketing,
            notifications, and secure role-based access in a single modern web platform.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn-primary hero-btn">
              Launch Platform
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-secondary hero-btn secondary-hero-btn">
              Explore Modules
            </Link>
          </div>

          <div className="hero-badges">
            <span><ShieldCheck size={16} /> Spring Boot REST API</span>
            <span><CheckCircle2 size={16} /> React Client App</span>
            <span><Users size={16} /> Team-built Coursework</span>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="glass-panel stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Built around the real assignment scope</h2>
          <p>
            The homepage now reflects the exact Smart Campus scenario from the brief instead of generic placeholder
            marketing text.
          </p>
        </div>

        <div className="features-grid">
          {modules.map(({ icon: Icon, title, description }) => (
            <article key={title} className="glass-panel feature-card">
              <div className="feature-icon">
                <Icon size={28} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="spotlight-section">
        <div className="glass-panel spotlight-panel">
          <div className="spotlight-copy">
            <p className="spotlight-label">Member 4 focus</p>
            <h2>Notifications, roles, and secure sign-in are now part of the landing story.</h2>
            <p>
              Since your contribution centers on notifications and authorization improvements, the homepage now
              surfaces those capabilities clearly so the system immediately communicates your team structure and your
              ownership area during demos.
            </p>

            <div className="highlight-list">
              {highlights.map((item) => (
                <div key={item} className="highlight-item">
                  <LockKeyhole size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
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

          <div className="spotlight-card">
            <div className="spotlight-metric">
              <BellRing size={22} />
              <span>Notification-ready experience</span>
            </div>
            <ul className="spotlight-points">
              <li>Booking approvals and rejections</li>
              <li>Ticket status changes and technician updates</li>
              <li>New comments and user preference controls</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-header">
          <h2>How the platform flows</h2>
          <p>
            The experience is designed for everyday university operations, from finding a resource to closing a
            maintenance issue with traceable updates.
          </p>
        </div>

        <div className="workflow-grid">
          {workflows.map((item) => (
            <div key={item.step} className="glass-panel workflow-card">
              <span className="workflow-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-panel">
          <p className="spotlight-label">Ready for demos and expansion</p>
          <h2>A stronger homepage for the common project foundation</h2>
          <p>
            This gives the whole team a more credible first screen while you continue building the module-specific
            features and shared project files.
          </p>
          <div className="cta-actions">
            <Link to="/login" className="btn-primary cta-btn">
              Sign In
            </Link>
            <Link to="/contact" className="btn-secondary cta-btn secondary-hero-btn">
              Contact Team
            </Link>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default Home;
