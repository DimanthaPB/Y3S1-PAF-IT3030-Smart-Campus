import React from 'react';
import './InfoPage.css';

const PrivacyPolicy = () => {
  return (
    <div className="info-page-container">
      <div className="info-header">
        <h1>Privacy Policy</h1>
        <p>Your privacy and data security are our absolute priority.</p>
      </div>
      
      <div className="glass-panel info-content" style={{ padding: '40px' }}>
        <h2>1. Information We Collect</h2>
        <p>
          When you use SmartCampus Hub, we only collect essential data required to provide you with university services. This includes your name, official university email address, display picture, and system usage history such as facility bookings or helpdesk interactions. We use the official Google OAuth Provider to verify identity securely.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          The information collected is strictly utilized for internal campus operations:
        </p>
        <ul>
          <li>To verify your identity and role (Student, Faculty, Staff).</li>
          <li>To process campus facility bookings and manage asset ownership.</li>
          <li>To send you important administrative and system notifications.</li>
          <li>To improve the campus IT infrastructure through anonymous traffic logs.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          SmartCampus Hub does not sell, rent, or distribute your personal data to external third parties. Information is only shared with authorized university administrators who require such data to facilitate standard academic and operational procedures.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          Your data is retained for the duration of your enrollment or employment with the university. Upon graduation or contract termination, your profile is archived in compliance with educational data retention policies.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to request access to your data, request corrections to inaccurate personal records, and adjust your notification preferences directly within the platform.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
