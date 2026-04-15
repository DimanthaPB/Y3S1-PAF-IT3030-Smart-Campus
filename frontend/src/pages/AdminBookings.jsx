import { useEffect, useState } from 'react';
import {
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from '../services/bookingService';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await getBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      alert('Booking approved');
      fetchBookings();
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
  const reason = prompt('Enter rejection reason:');

  if (!reason || !reason.trim()) {
    alert('Rejection reason is required');
    return;
  }

  try {
    await rejectBooking(id, reason);
    alert('Booking rejected');
    fetchBookings();
  } catch (error) {
    console.error('Reject failed:', error);
    alert('Failed to reject booking');
  }
};
 const handleCancel = async (id) => {
  const reason = prompt('Enter cancellation reason:');

  if (!reason || !reason.trim()) {
    alert('Cancellation reason is required');
    return;
  }

  try {
    await cancelBooking(id, reason);
    alert('Booking cancelled');
    fetchBookings();
  } catch (error) {
    console.error('Cancel failed:', error);
    alert('Failed to cancel booking');
  }
};

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading admin bookings...</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3>{booking.facilityName || 'Facility Name Not Available'}</h3>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Booked By:</strong> {booking.bookedBy}</p>
            <p><strong>Date:</strong> {booking.bookingDate}</p>
            <p><strong>Start Time:</strong> {booking.startTime}</p>
            <p><strong>End Time:</strong> {booking.endTime}</p>

           <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {booking.status === 'PENDING' && (
            <>
              <button onClick={() => handleApprove(booking.id)}>Approve</button>
              <button onClick={() => handleReject(booking.id)}>Reject</button>
            </>
          )}

          {booking.status === 'APPROVED' && (
            <button onClick={() => handleCancel(booking.id)}>Cancel</button>
          )}
        </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminBookings;