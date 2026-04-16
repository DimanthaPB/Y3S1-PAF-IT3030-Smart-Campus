import { useEffect, useState } from 'react';
import {
  createBooking,
  getBookingConflicts,
} from '../../services/bookingService';
import { getResources } from '../../utils/api';
import BookingNotice from './BookingNotice';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const formStyles = {
  card: {
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '28px',
    padding: '2rem',
    marginBottom: '2rem',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
  },
  sectionLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7dd3fc',
    marginBottom: '0.8rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.75rem',
  },
  text: {
    color: '#cbd5e1',
    marginBottom: '2rem',
    fontSize: '1rem',
    lineHeight: '1.7',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fieldWrap: {
    minWidth: 0,
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
  submitButton: {
    padding: '0.85rem 1.2rem',
    borderRadius: '12px',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    background: 'rgba(16, 185, 129, 0.20)',
    color: '#d1fae5',
    cursor: 'pointer',
    fontWeight: '700',
    transition: '0.2s ease',
  },
};

function BookingForm({ onBookingCreated, currentUserEmail }) {
  const conflictMessage = 'This resource is already booked for the selected time.';
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [attendeeError, setAttendeeError] = useState('');
  const [bookingConflictWarning, setBookingConflictWarning] = useState('');
  const [timeRangeError, setTimeRangeError] = useState('');
  const [formData, setFormData] = useState({
    resourceType: '',
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    purpose: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === 'expectedAttendees'
        ? value.replace(/[^0-9]/g, '').replace(/^0+/, '')
        : value;

    if (name === 'resourceId' || name === 'expectedAttendees') {
      setAttendeeError('');
    }

    if (
      name === 'resourceType' ||
      name === 'resourceId' ||
      name === 'bookingDate' ||
      name === 'startTime' ||
      name === 'endTime'
    ) {
      setBookingConflictWarning('');
      setTimeRangeError('');
    }

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

  useEffect(() => {
    const fetchResources = async () => {
      setResourcesLoading(true);

      try {
        const response = await getResources();
        setResources(response.data || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, []);

  const selectedResource = resources.find(
    (resource) => String(resource.id) === String(formData.resourceId)
  );
  const selectedResourceCapacity = Number(selectedResource?.capacity) || null;
  const availableFromDate = selectedResource?.availableFromDate || '';
  const availableToDate = selectedResource?.availableToDate || '';
  const availabilityStart = selectedResource?.availabilityStart || '';
  const availabilityEnd = selectedResource?.availabilityEnd || '';
  const resourceTypes = [...new Set(resources.map((resource) => resource?.type).filter(Boolean))];
  const activeResources = resources.filter(
    (resource) =>
      resource?.status === 'ACTIVE' &&
      (!formData.resourceType || resource?.type === formData.resourceType)
  );
  const isSubmitDisabled =
    resourcesLoading ||
    !currentUserEmail ||
    Boolean(attendeeError) ||
    Boolean(bookingConflictWarning) ||
    Boolean(timeRangeError);

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
        !formData.endTime
      ) {
        setBookingConflictWarning('');
        return;
      }

      if (formData.startTime >= formData.endTime) {
        setBookingConflictWarning('');
        return;
      }

      try {
        const response = await getBookingConflicts({
          resourceId: selectedResource.id,
          bookingDate: formData.bookingDate,
        });

        const conflictingBooking = (response.data || []).find((booking) => {
          const overlaps =
            booking.startTime &&
            booking.endTime &&
            formData.startTime < booking.endTime &&
            formData.endTime > booking.startTime;

          return overlaps;
        });

        if (conflictingBooking) {
          setBookingConflictWarning(conflictMessage);
          return;
        }

        setBookingConflictWarning('');
      } catch (error) {
        console.error('Error checking booking conflicts:', error);
        setBookingConflictWarning('');
      }
    };

    checkBookingConflict();
  }, [
    formData.bookingDate,
    formData.endTime,
    formData.startTime,
    selectedResource?.id,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resourceId = Number(formData.resourceId);
    const expectedAttendees = Number(formData.expectedAttendees);

    if (resourceId <= 0) {
      setFeedback({
        type: 'error',
        message: 'Please select a valid resource.',
      });
      return;
    }

    if (expectedAttendees <= 0) {
      setFeedback({
        type: 'error',
        message: 'Attendee count must be greater than 0.',
      });
      return;
    }

    if (
      selectedResourceCapacity &&
      expectedAttendees > selectedResourceCapacity
    ) {
      setAttendeeError(
        `Attendee count exceeded. Maximum allowed for this resource is ${selectedResourceCapacity}.`
      );
      return;
    }

    if (bookingConflictWarning) {
      setFeedback({
        type: 'error',
        message: bookingConflictWarning,
      });
      return;
    }

    if (timeRangeError) {
      setFeedback({
        type: 'error',
        message: timeRangeError,
      });
      return;
    }

    const bookingPayload = {
      resource: {
        id: resourceId,
      },
      bookedBy: currentUserEmail || undefined,
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      expectedAttendees,
      purpose: formData.purpose,
    };

    try {
      setFeedback(null);
      console.log('Booking payload being sent:', bookingPayload);
      await createBooking(bookingPayload);
      setFeedback({
        type: 'success',
        message: 'Booking created successfully.',
      });

      setFormData({
        resourceType: '',
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
        const errorMessage = getApiErrorMessage(
          error,
          'Failed to create booking'
        );

        setFeedback({
          type: 'error',
        message: errorMessage,
      });
    }
  };

  return (
    <div style={formStyles.card}>
      <div style={formStyles.sectionLabel}>Create</div>
      <h2 style={formStyles.title}>Create a New Booking</h2>
      <p style={formStyles.text}>
        Submit a new booking request with the facility, date, time, attendees,
        and purpose in one place.
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <BookingNotice
          type={feedback?.type}
          message={feedback?.message}
          onClose={() => setFeedback(null)}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={formStyles.fieldGrid}>
          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>Resource Type</label>
            <select
              name="resourceType"
              value={formData.resourceType}
              onChange={handleChange}
              disabled={resourcesLoading || resourceTypes.length === 0}
              style={formStyles.select}
            >
              <option
                value=""
                disabled
                hidden
                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              >
                {resourcesLoading
                  ? 'Loading resource types...'
                  : 'Select a resource type'}
              </option>
              {resourceTypes.map((resourceType) => (
                <option
                  key={resourceType}
                  value={resourceType}
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                >
                  {resourceType}
                </option>
              ))}
            </select>
          </div>

          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>Resource</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              required
              disabled={
                resourcesLoading ||
                !formData.resourceType ||
                activeResources.length === 0
              }
              style={formStyles.select}
            >
              <option
                value=""
                disabled
                hidden
                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              >
                {resourcesLoading
                  ? 'Loading resources...'
                  : !formData.resourceType
                  ? 'Select a resource type first'
                  : activeResources.length === 0
                  ? 'No active resources available for this type'
                  : 'Select a resource'}
              </option>
              {activeResources
                .filter((resource) => resource?.id && resource?.name)
                .map((resource) => (
                  <option
                    key={resource.id}
                    value={resource.id}
                    style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                  >
                    {resource.name} (ID: {resource.id})
                  </option>
                ))}
            </select>
            {selectedResource ? (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#cbd5e1',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Resource availability
                </div>
                <div>
                  Date range:{' '}
                  {availableFromDate && availableToDate
                    ? `${availableFromDate} to ${availableToDate}`
                    : 'Not specified'}
                </div>
                <div>
                  Time range:{' '}
                  {availabilityStart && availabilityEnd
                    ? `${availabilityStart} to ${availabilityEnd}`
                    : 'Not specified'}
                </div>
              </div>
            ) : null}
          </div>

          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>Booking Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              required
              min={availableFromDate || undefined}
              max={availableToDate || undefined}
              style={formStyles.input}
            />
          </div>

          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              min={availabilityStart || undefined}
              max={availabilityEnd || undefined}
              style={formStyles.input}
            />
          </div>

          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              min={availabilityStart || undefined}
              max={availabilityEnd || undefined}
              style={formStyles.input}
            />
            {timeRangeError ? (
              <div
                style={{
                  marginTop: '0.55rem',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                {timeRangeError}
              </div>
            ) : null}
          </div>

          <div style={formStyles.fieldWrap}>
            <label style={formStyles.label}>Attendee Count</label>
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              required
              min="1"
              style={formStyles.input}
            />
            {selectedResourceCapacity ? (
              <div
                style={{
                  marginTop: '0.55rem',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                Maximum attendees for this resource: {selectedResourceCapacity}
              </div>
            ) : null}
            {bookingConflictWarning ? (
              <div
                style={{
                  marginTop: '0.55rem',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                {bookingConflictWarning}
              </div>
            ) : null}
            {attendeeError ? (
              <div
                style={{
                  marginTop: '0.55rem',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                }}
              >
                {attendeeError}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={formStyles.label}>Purpose</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="4"
            required
            style={formStyles.textarea}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.background = 'rgba(16, 185, 129, 0.30)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = e.target.disabled
              ? 'rgba(16, 185, 129, 0.10)'
              : 'rgba(16, 185, 129, 0.20)';
          }}
          onFocus={(e) => {
            e.target.style.background = e.target.disabled
              ? 'rgba(16, 185, 129, 0.10)'
              : 'rgba(16, 185, 129, 0.20)';
          }}
          onBlur={(e) => {
            e.target.style.background = e.target.disabled
              ? 'rgba(16, 185, 129, 0.10)'
              : 'rgba(16, 185, 129, 0.20)';
          }}
          aria-disabled={isSubmitDisabled}
          style={{
            ...formStyles.submitButton,
            background: isSubmitDisabled
              ? 'rgba(16, 185, 129, 0.10)'
              : formStyles.submitButton.background,
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            opacity: isSubmitDisabled ? 0.65 : 1,
          }}
        >
          Create Booking
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
