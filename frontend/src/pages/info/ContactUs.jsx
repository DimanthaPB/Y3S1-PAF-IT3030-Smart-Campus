import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './InfoPage.css';

const ContactUs = () => {
  return (
    <div className="info-page-container">
      <div className="info-header">
        <h1>Contact Us</h1>
        <p>We're here to help. Reach out to our support team or technical administrators for any assistance.</p>
      </div>
      
      <div className="contact-grid">
        <div className="contact-info-block">
          <div className="glass-panel contact-method">
            <div className="contact-icon"><MapPin size={24} /></div>
            <div>
              <h4>Campus Location</h4>
              <p>SmartCampus IT Wing, Block C</p>
              <p>Colombo, Sri Lanka</p>
            </div>
          </div>
          
          <div className="glass-panel contact-method">
            <div className="contact-icon"><Mail size={24} /></div>
            <div>
              <h4>Email Support</h4>
              <p>General: info@smartcampus.edu</p>
              <p>Technical: tech-support@smartcampus.edu</p>
            </div>
          </div>

          <div className="glass-panel contact-method">
            <div className="contact-icon"><Phone size={24} /></div>
            <div>
              <h4>Hotline</h4>
              <p>+94 11 234 5678</p>
              <p>Available Mon-Fri, 9am - 5pm</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'white' }}>Send us a message</h3>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email Address" required />
            <textarea placeholder="How can we help you?" required></textarea>
            <button className="btn-primary" type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
