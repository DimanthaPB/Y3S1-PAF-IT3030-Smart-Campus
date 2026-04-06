import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Share2, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-glass">
      <div className="footer-container">
        <div className="footer-grid">
          
          <div className="footer-section brand-section">
            <Link to="/" className="brand-logo footer-logo">SmartCampus<span className="hub">Hub</span></Link>
            <p className="footer-desc">
              The next-generation centralized platform for managing university operations securely, efficiently, and elegantly.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><MessageCircle size={18} /></a>
              <a href="#" className="social-icon"><Share2 size={18} /></a>
              <a href="#" className="social-icon"><Globe size={18} /></a>
              <a href="#" className="social-icon"><Mail size={18} /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-info">
            <h4>Contact Details</h4>
            <p>Smart Campus HQ, University Wing</p>
            <p>Email: support@smartcampus.edu</p>
            <p>Phone: +1 800-CAMPUS-HUB</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartCampus Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
