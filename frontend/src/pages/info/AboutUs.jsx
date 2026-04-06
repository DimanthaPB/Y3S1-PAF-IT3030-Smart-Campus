import React from 'react';
import './InfoPage.css';

const AboutUs = () => {
  return (
    <div className="info-page-container">
      <div className="info-header">
        <h1>About SmartCampus</h1>
        <p>Revolutionizing university life by connecting students, faculty, and administration through a single, elegant platform.</p>
      </div>
      
      <div className="glass-panel info-content" style={{ padding: '40px' }}>
        <h2>Our Mission</h2>
        <p>
          At SmartCampus, our mission is to eliminate the friction of daily campus operations. We believe in providing an ecosystem where booking facilities, tracking academic progress, and managing administrative tasks are as seamless as checking your email.
        </p>

        <h2>Who We Are</h2>
        <p>
          We are a dedicated team of engineers, designers, and educators who understand the complexities of higher education infrastructure. By leveraging cutting-edge web technologies and prioritizing user experience, we've built a system that adapts to your university's unique needs.
        </p>

        <h2>Core Values</h2>
        <ul>
          <li><strong>Innovation:</strong> Constantly evolving to integrate the newest and most efficient technologies.</li>
          <li><strong>Security:</strong> Safeguarding student and faculty data with enterprise-grade encryption.</li>
          <li><strong>Accessibility:</strong> Designing elegant, intuitive interfaces that anyone can navigate easily.</li>
          <li><strong>Reliability:</strong> Ensuring 99.9% uptime so your campus never skips a beat.</li>
        </ul>

        <h2>Looking Forward</h2>
        <p>
          As universities become increasingly digitized, SmartCampus Hub will continue to serve as the foundational architecture for the campus of tomorrow.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
