import React from 'react';
import './InfoPage.css';

const FAQ = () => {
  const faqs = [
    {
      q: "How do I log into SmartCampus Hub?",
      a: "You can securely log in using your registered university Google Workspace email. Simply click the 'Sign In' button on the homepage and select your official university account."
    },
    {
      q: "How can I change my notification preferences?",
      a: "Once logged in, click the 'Preferences' link in the top navigation bar. You can toggle specific categories like Booking Alerts, System Maintenance, or Helpdesk Ticket updates. We will honor these settings immediately."
    },
    {
      q: "Are my details and data secure on this platform?",
      a: "Yes. SmartCampus utilizes enterprise-grade stateless authentication via JSON Web Tokens (JWT). All traffic is encrypted, and critical database fields are secured at rest."
    },
    {
      q: "I am unable to book a facility. What should I do?",
      a: "Ensure that your specific user role (Student, Staff, or Admin) has the appropriate permissions. If access is still restricted, please submit a Help Desk ticket or contact Technical Support."
    },
    {
      q: "Is there a mobile application available?",
      a: "Currently, SmartCampus Hub is a deeply responsive web application meaning you can use it perfectly across any modern smartphone or tablet browser without needing to download a separate app."
    }
  ];

  return (
    <div className="info-page-container">
      <div className="info-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find quick answers to common questions about using the SmartCampus platform.</p>
      </div>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="glass-panel faq-item">
            <h3>{faq.q}</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
