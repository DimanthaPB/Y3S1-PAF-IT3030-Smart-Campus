import React from 'react';
import './InfoPage.css';

const TermsOfService = () => {
  return (
    <div className="info-page-container">
      <section className="info-hero">
        <p className="info-eyebrow">Platform Usage Rules</p>
        <h1>Terms of Service</h1>
        <p className="info-lead">
          These terms describe the expected use of SmartCampus Hub as a university operations platform for resource
          booking, incident handling, and notification-driven workflows.
        </p>
      </section>

      <section className="glass-panel info-content">
        <h2>1. Acceptance of platform terms</h2>
        <p>
          By accessing SmartCampus Hub, users agree to use the platform only for appropriate university-related
          operational purposes and in a way that respects the rules, permissions, and workflows defined by the
          system.
        </p>

        <h2>2. Account responsibility</h2>
        <p>
          Users are responsible for activity performed through their authenticated account. Access credentials,
          third-party sign-in accounts, and personal devices used to access the platform should be kept secure.
        </p>

        <h2>3. Acceptable use</h2>
        <ul>
          <li>Provide truthful information when submitting bookings, tickets, or comments.</li>
          <li>Do not attempt to bypass role restrictions or access unauthorized data.</li>
          <li>Do not misuse upload features with harmful, offensive, or unrelated files.</li>
          <li>Do not disrupt the platform through spam, automation abuse, or malicious activity.</li>
        </ul>

        <h2>4. Booking and ticket conduct</h2>
        <p>
          Booking requests should be submitted for valid academic or operational purposes. Incident tickets should
          include relevant details and evidence where appropriate. Administrators and staff may approve, reject,
          update, or close records according to workflow rules and operational policy.
        </p>

        <h2>5. Platform changes</h2>
        <p>
          Features, statuses, access rules, or interface details may change as the system evolves. The team may
          update workflows to improve usability, security, or alignment with assignment and institutional needs.
        </p>

        <h2>6. Enforcement and support</h2>
        <p>
          Misuse of the platform may result in access restriction or administrative review. For help with access,
          usage, or policy questions, users should use the Contact Us page or the designated support channels.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
