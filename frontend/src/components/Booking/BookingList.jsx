import { useEffect, useState } from 'react';
import { getBookings } from '../../services/bookingService';
import BookingCard from './BookingCard';

function BookingList({ filters, refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await getBookings(cleanedFilters);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters, refreshKey]);

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <div>
      <h2>Booking List</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      )}
    </div>
  );
}

export default BookingList;