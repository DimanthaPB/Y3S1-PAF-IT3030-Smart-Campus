import { useState } from 'react';
import { createBooking } from '../../services/bookingService';

function BookingForm({ onBookingCreated }) {
  const [formData, setFormData] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    purpose: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingPayload = {
      resource: {
        id: Number(formData.resourceId),
      },
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      expectedAttendees: Number(formData.expectedAttendees),
      purpose: formData.purpose,
    };

    try {
      console.log('Booking payload being sent:', bookingPayload);
      await createBooking(bookingPayload);
      alert('Booking created successfully');

      setFormData({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        expectedAttendees: '',
        purpose: '',
      });

      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '1rem',
      }}
    >
      <h2>Create Booking</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Resource ID</label>
          <input
            type="number"
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Booking Date</label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Attendee Count</label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Purpose</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="4"
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit">Create Booking</button>
      </form>
    </div>
  );
}

export default BookingForm;