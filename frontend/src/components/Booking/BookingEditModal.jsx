import { useEffect, useMemo, useState } from 'react';
import { getBookingConflicts, updateBooking } from '../../services/bookingService';
import { getResources } from '../../utils/api';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const modalStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.72)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.25rem',
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: '920px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '28px',
    padding: '1.75rem',
    background: 'rgba(15, 23, 42, 0.96)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    color: '#f8fafc',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginTop: '1.25rem',
  },
  label: {
    display: 'block',
    color: '#dbe4f0',
    fontWeight: '600',
    marginBottom: '0.65rem',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.85rem 0.95rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '14px',
    color: '#ffffff',
    outline: 'none',
  },
  select: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.85rem 2.8rem 0.85rem 0.95rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '14px',
    color: '#ffffff',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
    backgroundPosition:
      'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
  },
  textarea: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.95rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '18px',
    color: '#ffffff',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
  },
  infoBox: {
    marginTop: '0.75rem',
    padding: '0.9rem 1rem',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#cbd5e1',
    lineHeight: '1.6',
  },
  footer: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '1.5rem',
  },
};

function getInitialFormData(booking) {
  const resourceType = booking?.resource?.type || '';
  const resourceId = booking?.resource?.id ? String(booking.resource.id) : '';

  return {
    resourceType,
    resourceId,
    bookingDate: booking?.bookingDate || '',
    startTime: booking?.startTime || '',
    endTime: booking?.endTime || '',
    expectedAttendees: booking?.expectedAttendees ? String(booking.expectedAttendees) : '',
    purpose: booking?.purpose || '',
  };
}

function BookingEditModal({ booking, open, onClose, onSaved }) {
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attendeeError, setAttendeeError] = useState('');
  const [timeRangeError, setTimeRangeError] = useState('');
  const [bookingConflictWarning, setBookingConflictWarning] = useState('');
  const [formData, setFormData] = useState(getInitialFormData(booking));

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(getInitialFormData(booking));
    setFeedback(null);
    setAttendeeError('');
    setTimeRangeError('');
    setBookingConflictWarning('');
  }, [booking, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadResources = async () => {
      setResourcesLoading(true);
      try {
        const response = await getResources();
        setResources(response.data || []);
      } catch (error) {
        console.error('Failed to load resources for editing:', error);
        setFeedback({
          type: 'error',
          message: getApiErrorMessage(error, 'Failed to load resources.'),
        });
      } finally {
        setResourcesLoading(false);
      }
    };

    loadResources();
  }, [open]);

  const resourceTypes = useMemo(
    () => [...new Set(resources.map((resource) => resource?.type).filter(Boolean))],
    [resources]
  );

  const activeResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource?.status === 'ACTIVE' &&
          (!formData.resourceType || resource?.type === formData.resourceType)
      ),
    [formData.resourceType, resources]
  );

  const selectedResource = useMemo(
    () => resources.find((resource) => String(resource.id) === String(formData.resourceId)),
    [formData.resourceId, resources]
  );

  const selectedResourceCapacity = Number(selectedResource?.capacity) || null;

  useEffect(() => {
    const attendeeCount = Number(formData.expectedAttendees);

    if (!formData.expectedAttendees || !selectedResourceCapacity) {
      setAttendeeError('');
      return;
    }

    if (attendeeCount > selectedResourceCapacity) {
      setAttendeeError(
        `Attendee count exceeded. Maximum allowed for this resource is ${selectedResourceCapacity}.`
      );
      return;
    }

    setAttendeeError('');
  }, [formData.expectedAttendees, selectedResourceCapacity]);

  useEffect(() => {
    if (!formData.startTime || !formData.endTime) {
      setTimeRangeError('');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setTimeRangeError('End time must be later than start time.');
      return;
    }

    setTimeRangeError('');
  }, [formData.endTime, formData.startTime]);

  useEffect(() => {
    const checkBookingConflict = async () => {
      if (
        !selectedResource?.id ||
        !formData.bookingDate ||
        !formData.startTime ||
        !formData.endTime ||
        formData.startTime >= formData.endTime
      ) {
        setBookingConflictWarning('');
        return;
      }

      try {
        const response = await getBookingConflicts({
          resourceId: selectedResource.id,
          bookingDate: formData.bookingDate,
        });

        const conflictingBooking = (response.data || []).find((existingBooking) => {
          if (String(existingBooking.id) === String(booking?.id)) {
            return false;
          }

          return (
            existingBooking.startTime &&
            existingBooking.endTime &&
            formData.startTime < existingBooking.endTime &&
            formData.endTime > existingBooking.startTime
          );
        });

        setBookingConflictWarning(
          conflictingBooking
            ? 'This time is already selected by another booking. Please choose a different start or end time.'
            : ''
        );
      } catch (error) {
        console.error('Error checking booking conflicts:', error);
        setBookingConflictWarning('');
      }
    };

    if (open) {
      checkBookingConflict();
    }
  }, [booking?.id, formData.bookingDate, formData.endTime, formData.startTime, open, selectedResource?.id]);

  if (!open || !booking) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    const sanitizedValue =
      name === 'expectedAttendees'
        ? value.replace(/[^0-9]/g, '').replace(/^0+/, '')
        : value;

    setFeedback(null);

    setFormData((prev) => ({
      ...prev,
      ...(name === 'resourceType'
        ? {
            resourceType: sanitizedValue,
            resourceId: '',
          }
        : null),
      [name]: sanitizedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const resourceId = Number(formData.resourceId);
    const expectedAttendees = Number(formData.expectedAttendees);

    if (resourceId <= 0) {
      setFeedback({ type: 'error', message: 'Please select a valid resource.' });
      return;
    }

    if (expectedAttendees <= 0) {
      setFeedback({
        type: 'error',
        message: 'Attendee count must be greater than 0.',
      });
      return;
    }

    if (attendeeError || timeRangeError || bookingConflictWarning) {
      setFeedback({
        type: 'error',
        message: attendeeError || timeRangeError || bookingConflictWarning,
      });
      return;
    }

    const bookingPayload = {
      resource: { id: resourceId },
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      expectedAttendees,
      purpose: formData.purpose,
    };

    try {
      setBusy(true);
      setFeedback(null);
      const response = await updateBooking(booking.id, bookingPayload);
      await onSaved?.(response.data);
      onClose?.();
    } catch (error) {
      console.error('Failed to update booking:', error);
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Failed to update booking.'),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.card}>
        <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ffffff' }}>Edit Booking</h3>
        <p style={{ marginTop: '0.85rem', marginBottom: 0, color: '#cbd5e1', lineHeight: '1.7' }}>
          Update the booking details while the request is still pending. The system will
          validate the resource, time range, and conflicts again before saving.
        </p>

        {feedback ? (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              background:
                feedback.type === 'error'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(16, 185, 129, 0.12)',
              border:
                feedback.type === 'error'
                  ? '1px solid rgba(239, 68, 68, 0.22)'
                  : '1px solid rgba(16, 185, 129, 0.22)',
              color: feedback.type === 'error' ? '#fecaca' : '#d1fae5',
            }}
          >
            {feedback.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={modalStyles.fieldGrid}>
            <div>
              <label style={modalStyles.label}>Resource Type</label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleChange}
                disabled={resourcesLoading || resourceTypes.length === 0 || busy}
                style={modalStyles.select}
              >
                <option value="" disabled hidden>
                  {resourcesLoading ? 'Loading resource types...' : 'Select a resource type'}
                </option>
                {resourceTypes.map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={modalStyles.label}>Resource</label>
              <select
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                disabled={resourcesLoading || !formData.resourceType || busy}
                style={modalStyles.select}
              >
                <option value="" disabled hidden>
                  {resourcesLoading
                    ? 'Loading resources...'
                    : !formData.resourceType
                    ? 'Select a resource type first'
                    : 'Select a resource'}
                </option>
                {activeResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} (ID: {resource.id})
                  </option>
                ))}
              </select>
              {selectedResource ? (
                <div style={modalStyles.infoBox}>
                  <div>Location: {selectedResource.location || 'Not specified'}</div>
                  <div>Capacity: {selectedResource.capacity || 'Not specified'}</div>
                  <div>
                    Hours: {selectedResource.availabilityStart || '--'} -{' '}
                    {selectedResource.availabilityEnd || '--'}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label style={modalStyles.label}>Booking Date</label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                disabled={busy}
                style={modalStyles.input}
              />
            </div>

            <div>
              <label style={modalStyles.label}>Expected Attendees</label>
              <input
                type="text"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleChange}
                disabled={busy}
                style={modalStyles.input}
              />
              {attendeeError ? (
                <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                  {attendeeError}
                </div>
              ) : null}
            </div>

            <div>
              <label style={modalStyles.label}>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={busy}
                style={modalStyles.input}
              />
              {bookingConflictWarning ? (
                <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                  {bookingConflictWarning}
                </div>
              ) : null}
            </div>

            <div>
              <label style={modalStyles.label}>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={busy}
                style={modalStyles.input}
              />
              {timeRangeError ? (
                <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                  {timeRangeError}
                </div>
              ) : null}
              {bookingConflictWarning ? (
                <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                  {bookingConflictWarning}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={modalStyles.label}>Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              disabled={busy}
              style={modalStyles.textarea}
            />
          </div>

          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '0.8rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                cursor: busy ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                opacity: busy ? 0.6 : 1,
              }}
            >
              Close
            </button>

            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '0.8rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#dbeafe',
                cursor: busy ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                opacity: busy ? 0.65 : 1,
              }}
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingEditModal;
