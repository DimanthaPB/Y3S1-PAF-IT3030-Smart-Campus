import { useState } from 'react';
import { cancelBooking, deleteBooking } from '../../services/bookingService';
import {
  getActionButtonStyle,
  getStatusBadgeStyle,
  infoCardStyle,
  inProgressNoticeStyle,
} from './bookingStyles';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import BookingActionModal from './BookingActionModal';
import BookingEditModal from './BookingEditModal';

function BookingCard({ booking, onBookingUpdated }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const detailCardStyles = {
    ...infoCardStyle,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '20px',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.06)',
    minWidth: 0,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  };

  const detailLabelStyles = {
    display: 'block',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  };

  const detailValueStyles = {
    display: 'block',
    color: '#ffffff',
    fontWeight: '700',
    minWidth: 0,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  };

  const handleCancel = async (reason) => {
    try {
      setIsCancelling(true);
      const response = await cancelBooking(booking.id, reason);
      setIsCancelModalOpen(false);
      onBookingUpdated?.({ type: 'update', booking: response.data });
    } catch (error) {
      console.error('Cancel failed:', error);
      alert(getApiErrorMessage(error, 'Failed to cancel booking'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBooking(booking.id);
      setIsDeleteModalOpen(false);
      onBookingUpdated?.({ type: 'delete', bookingId: booking.id });
    } catch (error) {
      console.error('Delete failed:', error);
      alert(getApiErrorMessage(error, 'Failed to delete booking'));
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = booking.status === 'PENDING';
  const canDelete = booking.status !== 'APPROVED';

  return (
    <>
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
              minWidth: 0,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {booking.facilityName ||
              booking.resource?.name ||
              'Facility Not Available'}
          </h3>

          <div style={getStatusBadgeStyle(booking.status)}>{booking.status}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'start',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={detailCardStyles}>
            <span style={detailLabelStyles}>Booking Date</span>
            <span style={detailValueStyles}>{booking.bookingDate}</span>
          </div>

          <div style={detailCardStyles}>
            <span style={detailLabelStyles}>Time</span>
            <span style={detailValueStyles}>
              {booking.startTime && booking.endTime ? (
                booking.startTime < booking.endTime ? (
                  `${booking.startTime} - ${booking.endTime}`
                ) : (
                  'Invalid Time Range'
                )
              ) : (
                'Time Not Available'
              )}
            </span>
          </div>

          <div style={detailCardStyles}>
            <span style={detailLabelStyles}>Attendees</span>
            <span style={detailValueStyles}>{booking.expectedAttendees || 0}</span>
          </div>
        </div>

        <div
          style={{
            ...detailCardStyles,
            marginBottom: '1.25rem',
          }}
        >
          <span style={detailLabelStyles}>Purpose</span>
          <div
            style={{
              ...detailValueStyles,
              fontWeight: '600',
              lineHeight: '1.7',
            }}
          >
            {booking.purpose || 'No purpose provided'}
          </div>
        </div>

        {(isCancelling || isDeleting) && (
          <div style={{ ...inProgressNoticeStyle, marginBottom: '1.25rem' }}>
            {isCancelling
              ? 'Cancellation in progress. Your booking list will refresh once the request finishes.'
              : 'Deletion in progress. Your booking list will refresh once the request finishes.'}
          </div>
        )}

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
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              {booking.status === 'REJECTED'
                ? 'Admin Rejection Reason'
                : 'Cancellation Reason'}
            </div>
            <div style={{ color: '#ffffff', fontWeight: '600', lineHeight: '1.7' }}>
              {booking.status === 'REJECTED'
                ? booking.rejectionReason
                : booking.cancelReason}
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canEdit && (
            <button
              disabled={isCancelling || isDeleting}
              onClick={() => setIsEditModalOpen(true)}
              style={{
                ...getActionButtonStyle({
                  tone: 'neutral',
                  disabled: isCancelling || isDeleting,
                }),
                padding: '0.85rem 1.4rem',
                borderRadius: '14px',
              }}
            >
              Edit Booking
            </button>
          )}

          {booking.status === 'APPROVED' && (
            <button
              disabled={isCancelling}
              onClick={() => setIsCancelModalOpen(true)}
              style={{
                ...getActionButtonStyle({
                  tone: 'cancel',
                  disabled: isCancelling,
                }),
                padding: '0.85rem 1.4rem',
                borderRadius: '14px',
                opacity: isCancelling ? 0.55 : 1,
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}

          {canDelete && (
            <button
              disabled={isDeleting || isCancelling}
              onClick={() => setIsDeleteModalOpen(true)}
              style={{
                ...getActionButtonStyle({
                  tone: 'reject',
                  disabled: isDeleting || isCancelling,
                }),
                padding: '0.85rem 1.4rem',
                borderRadius: '14px',
                opacity: isDeleting ? 0.55 : 1,
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Booking'}
            </button>
          )}
        </div>
      </div>

      <BookingEditModal
        booking={booking}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={onBookingUpdated}
      />

      <BookingActionModal
        open={isCancelModalOpen}
        title="Cancel booking"
        description="Cancelling an approved booking records a reason and updates the status so the schedule remains accurate."
        confirmLabel="Confirm Cancellation"
        requireReason
        reasonLabel="Cancellation reason"
        reasonPlaceholder="Explain why this booking needs to be cancelled"
        confirmTone="neutral"
        busy={isCancelling}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
      />

      <BookingActionModal
        open={isDeleteModalOpen}
        title="Delete booking"
        description="Delete this booking record permanently. Approved bookings must be cancelled before they can be deleted."
        confirmLabel="Delete Booking"
        confirmTone="danger"
        busy={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default BookingCard;
