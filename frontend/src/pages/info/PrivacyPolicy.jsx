import React from 'react';
import './InfoPage.css';

const PrivacyPolicy = () => {
  return (
    <div className="info-page-container">
      <section className="info-hero">
        <p className="info-eyebrow">Data And Access</p>
        <h1>Privacy Policy</h1>
        <p className="info-lead">
          This page explains how SmartCampus Hub handles identity data, operational records, and user-facing
          notifications within the scope of the university platform.
        </p>
      </section>

      <section className="glass-panel info-content">
        <h2>1. Information we collect</h2>
        <p>
          SmartCampus Hub collects the minimum information needed to support authentication, bookings, incident
          tracking, and notification delivery. This may include name, university email, profile details, role,
          booking history, ticket activity, comments, and notification preferences.
        </p>

        <h2>2. How information is used</h2>
        <p>Collected information is used to operate the platform and support core university workflows.</p>
        <ul>
          <li>Authenticate users through the configured sign-in provider.</li>
          <li>Authorize actions based on assigned user roles.</li>
          <li>Process facility bookings and conflict checks.</li>
          <li>Track maintenance incidents, comments, and status changes.</li>
          <li>Send relevant in-app notifications connected to user activity.</li>
        </ul>

        <h2>3. Access to records</h2>
        <p>
          Access to data is limited according to role and business need. Users should primarily see their own
          bookings, tickets, and notifications, while authorized staff or administrators may access broader
          operational data when required to manage the service.
        </p>

        <h2>4. Retention and auditability</h2>
        <p>
          Operational records may be retained for audit, reporting, troubleshooting, and administrative review.
          Booking decisions, ticket status changes, and important workflow updates should remain traceable to support
          accountability across the system.
        </p>

        <h2>5. User choices</h2>
        <p>
          Where notification preference controls are available, users may manage supported categories directly in the
          application. Users may also request corrections if profile information stored by the platform is inaccurate.
        </p>

        <h2>6. Security expectations</h2>
        <p>
          The platform is intended to follow secure development practices including authentication, authorization,
          input validation, and safe handling of uploaded files. Users are also responsible for protecting access to
          their own sign-in accounts.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
