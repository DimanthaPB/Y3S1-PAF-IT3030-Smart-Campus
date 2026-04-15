import { cancelBooking } from '../../services/bookingService';

function BookingCard({ booking, onBookingUpdated }) {
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
      onBookingUpdated?.();
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '28px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.20)',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            lineHeight: '1.2',
            margin: 0,
            color: '#ffffff',
          }}
        >
          {booking.facilityName ||
            booking.resource?.name ||
            'Facility Not Available'}
        </h3>

        <div
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '999px',
            fontWeight: '700',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            background:
              booking.status === 'APPROVED'
                ? 'rgba(16, 185, 129, 0.18)'
                : booking.status === 'PENDING'
                ? 'rgba(245, 158, 11, 0.18)'
                : booking.status === 'REJECTED'
                ? 'rgba(239, 68, 68, 0.18)'
                : 'rgba(107, 114, 128, 0.18)',
            color:
              booking.status === 'APPROVED'
                ? '#86efac'
                : booking.status === 'PENDING'
                ? '#fde68a'
                : booking.status === 'REJECTED'
                ? '#fca5a5'
                : '#d1d5db',
            border:
              booking.status === 'APPROVED'
                ? '1px solid rgba(16,185,129,0.3)'
                : booking.status === 'PENDING'
                ? '1px solid rgba(245,158,11,0.3)'
                : booking.status === 'REJECTED'
                ? '1px solid rgba(239,68,68,0.3)'
                : '1px solid rgba(107,114,128,0.3)',
          }}
        >
          {booking.status}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: '1rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
            Booking Date
          </div>
          <div style={{ color: '#ffffff', fontWeight: '700' }}>
            {booking.bookingDate}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: '1rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
            Time
          </div>
          <div style={{ color: '#ffffff', fontWeight: '700' }}>
            {booking.startTime && booking.endTime ? (
              booking.startTime < booking.endTime ? (
                `${booking.startTime} - ${booking.endTime}`
              ) : (
                'Invalid Time Range'
              )
            ) : (
              'Time Not Available'
            )}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: '1rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
            Attendees
          </div>
          <div style={{ color: '#ffffff', fontWeight: '700' }}>
            {booking.expectedAttendees || 0}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
          Purpose
        </div>
        <div style={{ color: '#ffffff', fontWeight: '600', lineHeight: '1.7' }}>
          {booking.purpose || 'No purpose provided'}
        </div>
      </div>

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
            padding: '0.85rem 1.4rem',
            borderRadius: '14px',
            background: 'rgba(107, 114, 128, 0.22)',
            border: '1px solid rgba(156, 163, 175, 0.35)',
            color: '#e5e7eb',
            cursor: 'pointer',
            fontWeight: '700',
            transition: '0.2s ease',
          }}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
}

export default BookingCard;
