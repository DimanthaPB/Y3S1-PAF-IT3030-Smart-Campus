import { useEffect, useMemo, useState } from 'react';
import BookingForm from '../components/Booking/BookingForm';
import BookingFilters from '../components/Booking/BookingFilters';
import BookingList from '../components/Booking/BookingList';
import { getBookings } from '../services/bookingService';
import { getCurrentUserEmail } from '../utils/auth';

const pageStyles = {
  wrapper: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#f8fafc',
  },
  heroCard: {
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '28px',
    padding: '2.2rem',
    marginBottom: '2rem',
    background:
      'radial-gradient(circle at top left, rgba(16, 185, 129, 0.12), transparent 22%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.10), transparent 24%), rgba(255,255,255,0.04)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
  },
  sectionLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7dd3fc',
    marginBottom: '0.8rem',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.1',
    margin: 0,
    color: '#ffffff',
  },
  heroText: {
    marginTop: '1rem',
    marginBottom: 0,
    maxWidth: '900px',
    fontSize: '1.15rem',
    lineHeight: '1.8',
    color: '#cbd5e1',
  },
};

function Bookings() {
  const currentUserEmail = getCurrentUserEmail();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    facilityName: '',
    bookingDate: '',
    sortBy: 'latest',
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUserEmail) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBookings({ bookedBy: currentUserEmail });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUserEmail]);

  const handleBookingCreated = (newBooking) => {
    if (!newBooking?.id) {
      return;
    }

    setBookings((previousBookings) => [newBooking, ...previousBookings]);
  };

  const handleBookingChanged = (change) => {
    if (!change) {
      return;
    }

    if (change.type === 'delete' && change.bookingId) {
      setBookings((previousBookings) =>
        previousBookings.filter((booking) => booking.id !== change.bookingId)
      );
      return;
    }

    if (change.type === 'update' && change.booking?.id) {
      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === change.booking.id ? change.booking : booking
        )
      );
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter((booking) =>
        (booking.status || '').toLowerCase().includes(filters.status.toLowerCase())
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

    filtered.sort((leftBooking, rightBooking) => {
      const leftTimestamp = new Date(
        leftBooking?.bookingDate && leftBooking?.startTime
          ? `${leftBooking.bookingDate}T${leftBooking.startTime}`
          : leftBooking?.bookingDate || 0
      ).getTime();
      const rightTimestamp = new Date(
        rightBooking?.bookingDate && rightBooking?.startTime
          ? `${rightBooking.bookingDate}T${rightBooking.startTime}`
          : rightBooking?.bookingDate || 0
      ).getTime();

      if (filters.sortBy === 'oldest') {
        if (leftTimestamp !== rightTimestamp) {
          return leftTimestamp - rightTimestamp;
        }

        return (leftBooking.id ?? 0) - (rightBooking.id ?? 0);
      }

      if (rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return (rightBooking.id ?? 0) - (leftBooking.id ?? 0);
    });

    return filtered;
  }, [bookings, filters]);

  return (
    <div className="page-container" style={pageStyles.wrapper}>
      <div style={pageStyles.heroCard}>
        <div style={pageStyles.sectionLabel}>My Booking Dashboard</div>

        <h1 style={pageStyles.heroTitle}>My Bookings</h1>

        <p style={pageStyles.heroText}>
          View your booking history, track current requests, and quickly check
          the status of approved, pending, rejected, or cancelled bookings.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '1.5rem',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
            Total Bookings
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff' }}>
            {bookings.length}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
            All of your submitted bookings.
          </div>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '24px',
            padding: '1.5rem',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
            Approved
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#d1fae5' }}>
            {bookings.filter((b) => b.status === 'APPROVED').length}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
            Successfully approved bookings.
          </div>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '24px',
            padding: '1.5rem',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
            Pending
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fde68a' }}>
            {bookings.filter((b) => b.status === 'PENDING').length}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
            Waiting for admin approval.
          </div>
        </div>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '24px',
            padding: '1.5rem',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
            Rejected / Cancelled
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fecaca' }}>
            {
              bookings.filter(
                (b) => b.status === 'REJECTED' || b.status === 'CANCELLED'
              ).length
            }
          </div>
          <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
            Bookings that are no longer active.
          </div>
        </div>
      </div>

      <BookingForm
        onBookingCreated={handleBookingCreated}
        currentUserEmail={currentUserEmail}
      />

      <div style={{ marginTop: '2rem' }}>
        <BookingFilters
          filters={filters}
          setFilters={setFilters}
          filteredCount={filteredBookings.length}
          totalCount={bookings.length}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <BookingList
          bookings={bookings}
          filters={filters}
          loading={loading}
          onBookingUpdated={handleBookingChanged}
        />
      </div>
    </div>
  );
}

export default Bookings;
