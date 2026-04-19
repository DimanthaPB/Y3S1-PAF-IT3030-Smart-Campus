import React from 'react';
import { BellRing, CalendarClock, ShieldCheck, Wrench } from 'lucide-react';
import './InfoPage.css';

const pillars = [
  {
    icon: CalendarClock,
    title: 'Operational clarity',
    description:
      'Booking requests, approvals, cancellations, and resource visibility are managed through one clear workflow.',
  },
  {
    icon: Wrench,
    title: 'Reliable issue handling',
    description:
      'Maintenance incidents can be reported, assigned, updated, and resolved with proper status tracking.',
  },
  {
    icon: BellRing,
    title: 'Meaningful notifications',
    description:
      'Users stay informed when bookings change, tickets progress, or comments are added to their records.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure access control',
    description:
      'OAuth sign-in and role-based authorization help protect workflows for users, admins, and staff.',
  },
];

const AboutUs = () => {
  return (
    <div className="info-page-container">
      <section className="info-hero">
        <p className="info-eyebrow">Smart Campus Operations Hub</p>
        <h1>About Us</h1>
        <p className="info-lead">
          SmartCampus Hub is a coursework-driven university operations platform built for the IT3030 PAF 2026
          assignment. It is designed to bring facility bookings, asset tracking, incident ticketing, notifications,
          and secure access into one connected experience.
        </p>
      </section>

      <section className="glass-panel info-content">
        <div className="info-grid">
          <div>
            <h2>Why this platform exists</h2>
            <p>
              Universities handle many daily operational requests across different systems and departments. Our goal
              is to reduce that friction by providing a single web application where users can discover resources,
              request bookings, report problems, and follow updates without losing visibility.
            </p>
          </div>
          <div>
            <h2>What the system covers</h2>
            <p>
              The platform reflects the assignment brief directly: facilities and assets catalogue management, booking
              workflows, maintenance and incident ticketing, notifications, and role-based authentication and
              authorization.
            </p>
          </div>
        </div>

        <h2>Design principles</h2>
        <div className="info-card-grid">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="info-card">
              <div className="info-card-icon">
                <pillar.icon size={24} />
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="info-grid">
          <div>
            <h2>Team contribution model</h2>
            <p>
              The system is being developed as a group project with clearly separated module ownership. This helps
              the team demonstrate individual contribution in the viva while still delivering one shared, coherent
              product.
            </p>
          </div>
          <div>
            <h2>Member 4 focus</h2>
            <p>
              A key part of this implementation is strengthening the common foundation and highlighting notifications,
              OAuth-based sign-in, and role-aware behavior across the application so those responsibilities are visible
              in both the UI and system behavior.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
