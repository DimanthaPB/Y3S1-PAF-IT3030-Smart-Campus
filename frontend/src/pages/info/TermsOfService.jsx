import React from 'react';
import './InfoPage.css';

const TermsOfService = () => {
  return (
    <div className="info-page-container">
      <div className="info-header">
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using the SmartCampus Hub.</p>
      </div>
      
      <div className="glass-panel info-content" style={{ padding: '40px' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using SmartCampus Hub ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must not access the platform.
        </p>

        <h2>2. User Accounts</h2>
        <p>
          You are responsible for safeguarding the credentials used to access the platform. Because we utilize university-provided Single Sign-On (Google OAuth), maintaining the security of your core email account is your responsibility. Any malicious activity traced to your account will be reported to university administration.
        </p>

        <h2>3. Acceptable Use</h2>
        <p>
          You agree not to:
        </p>
        <ul>
          <li>Use the platform for any illegal or unauthorized academic purpose.</li>
          <li>Attempt to breach the security of the platform or access unauthorized admin panels.</li>
          <li>Use automation scripts or bots to spam the facility booking or notification system.</li>
          <li>Upload malicious payloads or offensive materials via the Helpdesk attachment functions.</li>
        </ul>

        <h2>4. Facility Bookings</h2>
        <p>
          Any facility or asset booked through the platform must be utilized for its intended academic or official extracurricular purpose. The administration reserves the right to cancel any booking without prior notice in the event of campus emergencies.
        </p>

        <h2>5. Modification of Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue the platform (or any part thereof) at any time, with or without notice. We shall not be liable to you or to any third party for any modification or suspension of the service.
        </p>

        <h2>6. Contact Information</h2>
        <p>
          For issues regarding these Terms, please submit a query via the Contact Us page or directly to the University IT Compliance Officer.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
