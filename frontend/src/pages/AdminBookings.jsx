import { useEffect, useMemo, useState } from 'react';
import {
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from '../services/bookingService';

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

const filterInputStyles = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.75rem 0.9rem',
  marginTop: '0.65rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#ffffff',
  outline: 'none',
};

const filterSelectStyles = {
  ...filterInputStyles,
  paddingRight: '2.8rem',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
  backgroundPosition: 'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
  backgroundSize: '6px 6px, 6px 6px',
  backgroundRepeat: 'no-repeat',
};

const bookingInfoCardStyles = {
  margin: 0,
  padding: '1rem 1.1rem',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#e2e8f0',
  lineHeight: '1.7',
};

function AdminBookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: '',
    bookedBy: '',
    facilityName: '',
    bookingDate: '',
  });

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const response = await getBookings();
      setAllBookings(response.data);
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    let filtered = [...allBookings];

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
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

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to approve this booking?'
    );
    if (!confirmed) return;

    try {
      await approveBooking(id);
      alert('Booking approved successfully');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to reject this booking?'
    );
    if (!confirmed) return;

    const reason = prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    try {
      await rejectBooking(id, reason);
      alert('Booking rejected successfully');
      fetchBookings();
    } catch (error) {
      console.error('Reject failed:', error);
      alert('Failed to reject booking');
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );
    if (!confirmed) return;

    const reason = prompt('Enter cancellation reason:');
    if (!reason || !reason.trim()) {
      alert('Cancellation reason is required');
      return;
    }

    try {
      await cancelBooking(id, reason);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      bookedBy: '',
      facilityName: '',
      bookingDate: '',
    });
  };

  if (loading) {
    return (
      <div style={pageStyles.wrapper}>
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
          Loading admin bookings...
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.wrapper}>
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
      {allBookings.length}
    </div>
    <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
      All bookings currently in the system.
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
      {allBookings.filter((b) => b.status === 'APPROVED').length}
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
      {allBookings.filter((b) => b.status === 'PENDING').length}
    </div>
    <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
      Waiting for admin review.
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
        allBookings.filter(
          (b) => b.status === 'REJECTED' || b.status === 'CANCELLED'
        ).length
      }
    </div>
    <div style={{ color: '#cbd5e1', marginTop: '0.75rem' }}>
      Bookings that are no longer active.
    </div>
  </div>
</div>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '28px',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        }}
      >
        <div style={pageStyles.sectionLabel}>Discover</div>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '0.75rem',
          }}
        >
          Search and Filter Bookings
        </h2>
        <p
          style={{
            color: '#cbd5e1',
            marginBottom: '2rem',
            fontSize: '1rem',
            lineHeight: '1.7',
          }}
        >
          Narrow booking results by status, user, facility name, or date without
          leaving the page.
        </p>
        <p
          style={{
            marginTop: 0,
            marginBottom: '1.5rem',
            color: '#cbd5e1',
            fontSize: '0.95rem',
          }}
        >
          Showing {filteredBookings.length} of {allBookings.length} bookings
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            style={filterSelectStyles}
          >
            <option value="" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              All
            </option>
            <option value="PENDING" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              PENDING
            </option>
            <option value="APPROVED" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              APPROVED
            </option>
            <option value="REJECTED" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              REJECTED
            </option>
            <option value="CANCELLED" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
              CANCELLED
            </option>
          </select>
        </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <label>Booked By</label>
                  <input
                    type="text"
                    name="bookedBy"
                    value={filters.bookedBy}
                    onChange={handleFilterChange}
                    style={filterInputStyles}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label>Facility Name</label>
                  <input
                    type="text"
                    name="facilityName"
                    value={filters.facilityName}
                    onChange={handleFilterChange}
                    style={filterInputStyles}
                  />
                </div>
              </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Booking Date</label>
        <input
          type="date"
          name="bookingDate"
          value={filters.bookingDate}
          onChange={handleFilterChange}
          style={filterInputStyles}
        />
      </div>

      <button
        type="button"
        onClick={handleClearFilters}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.14)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.08)';
        }}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.08)',
          color: '#ffffff',
          cursor: 'pointer',
          marginTop: '0.5rem',
          transition: '0.2s ease',
        }}
      >
        Clear Filters
      </button>
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
            Try changing the filters to see more bookings in the admin queue.
          </div>
        </div>
      ) : (
        filteredBookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '28px',
              padding: '2rem',
              marginBottom: '1.75rem',
              background:
                'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%), rgba(255,255,255,0.04)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.20)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '2.1rem',
                  fontWeight: '800',
                  lineHeight: '1.2',
                  margin: 0,
                  color: '#ffffff',
                }}
              >
                {booking.facilityName ||
                  booking.resource?.name ||
                  'Facility Name Not Available'}
              </h3>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                  background:
                    booking.status === 'APPROVED'
                      ? 'rgba(16, 185, 129, 0.18)'
                      : booking.status === 'REJECTED'
                      ? 'rgba(239, 68, 68, 0.18)'
                      : booking.status === 'CANCELLED'
                      ? 'rgba(107, 114, 128, 0.22)'
                      : 'rgba(245, 158, 11, 0.18)',
                  border:
                    booking.status === 'APPROVED'
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : booking.status === 'REJECTED'
                      ? '1px solid rgba(239, 68, 68, 0.35)'
                      : booking.status === 'CANCELLED'
                      ? '1px solid rgba(156, 163, 175, 0.35)'
                      : '1px solid rgba(245, 158, 11, 0.35)',
                  color:
                    booking.status === 'APPROVED'
                      ? '#d1fae5'
                      : booking.status === 'REJECTED'
                      ? '#fecaca'
                      : booking.status === 'CANCELLED'
                      ? '#e5e7eb'
                      : '#fde68a',
                }}
              >
                {booking.status}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '1rem',
                marginTop: '1.2rem',
                marginBottom: '1.5rem',
                fontSize: '1rem',
              }}
            >
              <p style={bookingInfoCardStyles}>
                <strong>Booked By:</strong> {booking.bookedBy || 'Not Available'}
              </p>

              <p style={bookingInfoCardStyles}>
                <strong>Date:</strong> {booking.bookingDate}
              </p>

              <p style={bookingInfoCardStyles}>
                <strong>Start Time:</strong>{' '}
                {booking.startTime || 'Not Available'}
              </p>

              <p style={bookingInfoCardStyles}>
                <strong>End Time:</strong>{' '}
                {booking.endTime || 'Not Available'}
              </p>

              <p style={bookingInfoCardStyles}>
                <strong>Attendee Count:</strong>{' '}
                {booking.expectedAttendees ?? 'Not Available'}
              </p>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p style={{ margin: 0, lineHeight: '1.8', color: '#dbe4f0' }}>
                <strong>Purpose:</strong>{' '}
                {booking.purpose || 'Not Available'}
              </p>
            </div>

            {(booking.status === 'REJECTED' && booking.rejectionReason) ||
            (booking.status === 'CANCELLED' && booking.cancelReason) ? (
              <div
                style={{
                  background:
                    booking.status === 'REJECTED'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(107, 114, 128, 0.12)',
                  borderRadius: '20px',
                  padding: '1rem',
                  border:
                    booking.status === 'REJECTED'
                      ? '1px solid rgba(239, 68, 68, 0.18)'
                      : '1px solid rgba(156, 163, 175, 0.18)',
                  marginTop: '1rem',
                }}
              >
                <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                  {booking.status === 'REJECTED'
                    ? 'Rejection Reason'
                    : 'Cancellation Reason'}
                </div>
                <div
                  style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    lineHeight: '1.7',
                  }}
                >
                  {booking.status === 'REJECTED'
                    ? booking.rejectionReason
                    : booking.cancelReason}
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(booking.id)}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.32)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.22)';
                    }}
                    style={{
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.22)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#d1fae5',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: '0.2s ease',
                      opacity: 0.9,
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(booking.id)}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    }}
                    style={{
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#fecaca',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: '0.2s ease',
                      opacity: 0.9,
                    }}
                  >
                    Reject
                  </button>
                </>
              )}

              {booking.status === 'APPROVED' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.32)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.22)';
                  }}
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(107, 114, 128, 0.22)',
                    border: '1px solid rgba(156, 163, 175, 0.35)',
                    color: '#e5e7eb',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: '0.2s ease',
                    opacity: 0.9,
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminBookings;
