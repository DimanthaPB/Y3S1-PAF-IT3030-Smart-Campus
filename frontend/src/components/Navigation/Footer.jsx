import React from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Mail, MapPin, ShieldCheck } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-glass">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section brand-section">
            <Link to="/" className="brand-logo footer-logo">
              SmartCampus<span className="hub">Hub</span>
            </Link>
            <p className="footer-desc">
              A shared Smart Campus Operations Hub for facilities, bookings, incident handling, notifications, and
              secure role-aware access across the university workflow.
            </p>
            <div className="footer-highlights">
              <span><BellRing size={15} /> Notifications</span>
              <span><ShieldCheck size={15} /> OAuth Access</span>
            </div>
          </div>

          <div className="footer-section">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Policies</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-info">
            <h4>Project Contact</h4>
            <p><MapPin size={15} /> Faculty of Computing, SLIIT</p>
            <p><Mail size={15} /> smartcampus.team@campus.local</p>
            <p>Built for IT3030 PAF 2026 group coursework.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartCampus Hub. Built for Smart Campus Operations Hub coursework.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
