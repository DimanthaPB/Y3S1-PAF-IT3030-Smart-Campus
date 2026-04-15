import { useEffect, useMemo, useState } from 'react';
import { getBookings } from '../../services/bookingService';
import BookingCard from './BookingCard';

function BookingList({ filters, refreshKey, currentUserEmail }) {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!currentUserEmail) {
      setAllBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getBookings({ bookedBy: currentUserEmail });
      setAllBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUserEmail, refreshKey]);

  const filteredBookings = useMemo(() => {
    let filtered = [...allBookings];

    if (filters.status) {
      filtered = filtered.filter((booking) =>
        (booking.status || '')
          .toLowerCase()
          .includes(filters.status.toLowerCase())
      );
    }

    if (filters.bookedBy) {
      filtered = filtered.filter((booking) =>
        (booking.bookedBy || '')
          .toLowerCase()
          .includes(filters.bookedBy.toLowerCase())
      );
    }

    if (filters.facilityName) {
      filtered = filtered.filter((booking) =>
        (booking.facilityName || booking.resource?.name || '')
          .toLowerCase()
          .includes(filters.facilityName.toLowerCase())
      );
    }

    if (filters.bookingDate) {
      filtered = filtered.filter(
        (booking) => booking.bookingDate === filters.bookingDate
      );
    }

    return filtered;
  }, [allBookings, filters]);

  if (loading) {
    return (
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '28px',
          padding: '2rem',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          textAlign: 'center',
          color: '#cbd5e1',
          fontSize: '1.05rem',
        }}
      >
        Loading your bookings...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#7dd3fc',
            marginBottom: '0.8rem',
          }}
        >
          Results
        </div>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#ffffff',
            margin: 0,
          }}
        >
          Booking List
        </h2>
      </div>

      {filteredBookings.length === 0 ? (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '28px',
            padding: '2rem',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.1rem',
              color: '#cbd5e1',
              marginBottom: '0.75rem',
            }}
          >
            No bookings found
          </div>

          <div
            style={{
              color: '#94a3b8',
              lineHeight: '1.7',
            }}
          >
            Try changing your filters or create a new booking to see it appear here.
          </div>
        </div>
      ) : (
        filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onBookingUpdated={fetchBookings}
          />
        ))
      )}
    </div>
  );
}

export default BookingList;
