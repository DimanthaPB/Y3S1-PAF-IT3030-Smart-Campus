import React from 'react';
import { CircleHelp } from 'lucide-react';
import './InfoPage.css';

const faqs = [
  {
    question: 'How do users sign in to SmartCampus Hub?',
    answer:
      'Users sign in through the platform login flow with OAuth-based authentication. Access to features can then be limited by role such as USER, ADMIN, or technical staff roles introduced by the team.',
  },
  {
    question: 'What can be booked through this system?',
    answer:
      'The assignment scope includes lecture halls, labs, meeting rooms, and equipment such as projectors or cameras. Each resource can include metadata like type, capacity, location, and availability status.',
  },
  {
    question: 'How does the booking workflow work?',
    answer:
      'Bookings start as pending requests. Authorized admins can approve or reject them, and approved bookings can later be cancelled. The system should also prevent overlapping reservations for the same resource.',
  },
  {
    question: 'Can users report maintenance issues?',
    answer:
      'Yes. Users can create incident tickets for a location or resource, include a category and priority, and optionally attach image evidence. Tickets then move through statuses such as OPEN, IN_PROGRESS, RESOLVED, and CLOSED.',
  },
  {
    question: 'What notifications should users expect?',
    answer:
      'Users should receive notifications for booking approval or rejection, ticket status changes, and new comments on their own tickets. These updates should be accessible from the web interface.',
  },
  {
    question: 'Why are these pages written like a real product instead of a generic demo?',
    answer:
      'These public pages are being aligned with the actual IT3030 assignment brief so the system feels consistent during demonstrations and better communicates the project scope and team responsibilities.',
  },
];

const FAQ = () => {
  return (
    <div className="info-page-container">
      <section className="info-hero">
        <p className="info-eyebrow">Common Questions</p>
        <h1>FAQs</h1>
        <p className="info-lead">
          Quick answers about how SmartCampus Hub works, what the platform includes, and how the assignment-driven
          workflows are expected to behave.
        </p>
      </section>

      <section className="faq-list">
        {faqs.map((faq) => (
          <article key={faq.question} className="glass-panel faq-item">
            <div className="faq-icon">
              <CircleHelp size={18} />
            </div>
            <div>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default FAQ;
