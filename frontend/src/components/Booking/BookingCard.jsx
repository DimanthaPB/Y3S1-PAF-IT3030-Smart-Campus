function BookingCard({ booking }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      <h3>{booking.facilityName || booking.resource?.name || 'Facility Name Not Available'}</h3>
      <p><strong>Status:</strong> {booking.status}</p>
      <p><strong>Booked By:</strong> {booking.bookedBy || 'Not Available'}</p>
      <p><strong>Date:</strong> {booking.bookingDate}</p>
      <p><strong>Start Time:</strong> {booking.startTime}</p>
      <p><strong>End Time:</strong> {booking.endTime}</p>
      <p><strong>Attendee Count:</strong> {booking.expectedAttendees ?? 'Not Available'}</p>
      <p><strong>Purpose:</strong> {booking.purpose || 'Not Available'}</p>
    </div>
  );
}

export default BookingCard;