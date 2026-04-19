import React from 'react';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import './InfoPage.css';

const contacts = [
  {
    icon: MapPin,
    title: 'Project Coordination',
    lines: ['SmartCampus Hub Team', 'Faculty of Computing Workspace', 'SLIIT, Sri Lanka'],
  },
  {
    icon: Mail,
    title: 'Email Channels',
    lines: ['General: smartcampus.team@campus.local', 'Technical: support.smartcampus@campus.local'],
  },
  {
    icon: Phone,
    title: 'Support Line',
    lines: ['+94 11 555 2026', 'Weekdays, 8.30 AM - 5.00 PM'],
  },
  {
    icon: Clock3,
    title: 'Response Window',
    lines: ['Priority incidents are reviewed first', 'General queries are answered within one working day'],
  },
];

const ContactUs = () => {
  return (
    <div className="info-page-container">
      <section className="info-hero">
        <p className="info-eyebrow">Support And Communication</p>
        <h1>Contact Us</h1>
        <p className="info-lead">
          Use this page for support, technical help, or questions about bookings, incidents, notifications, or access
          to the SmartCampus Hub platform.
        </p>
      </section>

      <section className="contact-grid">
        <div className="contact-info-block">
          {contacts.map((contact) => (
            <article key={contact.title} className="glass-panel contact-method">
              <div className="contact-icon">
                <contact.icon size={22} />
              </div>
              <div>
                <h3>{contact.title}</h3>
                {contact.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="glass-panel contact-form-panel">
          <p className="info-eyebrow">Send A Message</p>
          <h2>Tell us what you need</h2>
          <p className="contact-support-copy">
            This form is styled as part of the shared project foundation and can later be connected to a backend
            support or inquiry endpoint when the team is ready.
          </p>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your name" required />
            <input type="email" placeholder="Your email address" required />
            <input type="text" placeholder="Subject" required />
            <textarea placeholder="Describe your issue or request" required></textarea>
            <button className="btn-primary" type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
