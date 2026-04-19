export const getTodayDateString = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export const getCurrentTimeString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(11, 16);
};

export const sanitizeExpectedAttendees = (value) =>
  value.replace(/[^0-9]/g, '').replace(/^0+/, '');

const DEFAULT_BOOKING_DURATION_MINUTES = 30;

const parseTimeToMinutes = (timeValue = '') => {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const [hoursText, minutesText] = timeValue.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

export const formatMinutesToTimeString = (totalMinutes) => {
  if (!Number.isFinite(totalMinutes)) {
    return '';
  }

  const normalizedMinutes = Math.max(0, totalMinutes);
  const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, '0');
  const minutes = String(normalizedMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
};

export const getMinimumBookingDate = (availableFromDate = '', todayDate = getTodayDateString()) =>
  availableFromDate && availableFromDate > todayDate ? availableFromDate : todayDate;

export const getMinimumBookingTime = ({
  bookingDate = '',
  todayDate = getTodayDateString(),
  availabilityStart = '',
  currentTime = getCurrentTimeString(),
}) => {
  if (bookingDate !== todayDate) {
    return availabilityStart;
  }

  const availabilityStartMinutes = parseTimeToMinutes(availabilityStart);
  const currentTimeMinutes = parseTimeToMinutes(currentTime);

  return availabilityStartMinutes === null ||
    (currentTimeMinutes !== null && currentTimeMinutes > availabilityStartMinutes)
    ? currentTime
    : availabilityStart;
};

export const getAttendeeValidationMessage = (expectedAttendees, selectedResourceCapacity) => {
  const attendeeCount = Number(expectedAttendees);

  if (!expectedAttendees || !selectedResourceCapacity) {
    return '';
  }

  if (attendeeCount > selectedResourceCapacity) {
    return `Attendee count exceeded. Maximum allowed for this resource is ${selectedResourceCapacity}.`;
  }

  return '';
};

export const getTimeRangeValidationMessage = ({
  startTime = '',
  endTime = '',
  minimumBookingTime = '',
}) => {
  const startTimeMinutes = parseTimeToMinutes(startTime);
  const endTimeMinutes = parseTimeToMinutes(endTime);
  const minimumBookingTimeMinutes = parseTimeToMinutes(minimumBookingTime);

  if (!startTime || !endTime) {
    return '';
  }

  if (
    minimumBookingTime &&
    startTimeMinutes !== null &&
    minimumBookingTimeMinutes !== null &&
    startTimeMinutes < minimumBookingTimeMinutes
  ) {
    return 'Start time cannot be earlier than the current time.';
  }

  if (
    minimumBookingTime &&
    endTimeMinutes !== null &&
    minimumBookingTimeMinutes !== null &&
    endTimeMinutes < minimumBookingTimeMinutes
  ) {
    return 'End time cannot be earlier than the current time.';
  }

  if (
    startTimeMinutes !== null &&
    endTimeMinutes !== null &&
    startTimeMinutes >= endTimeMinutes
  ) {
    return 'End time must be later than start time.';
  }

  return '';
};

export const shouldCheckBookingConflict = ({ resourceId, bookingDate, startTime, endTime }) =>
  Boolean(
    resourceId &&
      bookingDate &&
      startTime &&
      parseTimeToMinutes(startTime) !== null &&
      (
        !endTime ||
        (
          parseTimeToMinutes(endTime) !== null &&
          parseTimeToMinutes(startTime) < parseTimeToMinutes(endTime)
        )
      )
  );

export const hasTimeOverlap = ({ startTime, endTime, existingStartTime, existingEndTime }) => {
  const startTimeMinutes = parseTimeToMinutes(startTime);
  const endTimeMinutes = parseTimeToMinutes(endTime);
  const existingStartTimeMinutes = parseTimeToMinutes(existingStartTime);
  const existingEndTimeMinutes = parseTimeToMinutes(existingEndTime);

  return Boolean(
    startTimeMinutes !== null &&
      endTimeMinutes !== null &&
      existingStartTimeMinutes !== null &&
      existingEndTimeMinutes !== null &&
      startTimeMinutes < existingEndTimeMinutes &&
      endTimeMinutes > existingStartTimeMinutes
  );
};

export const findConflictingBooking = ({
  startTime = '',
  endTime = '',
  existingBookings = [],
  ignoredBookingId = null,
}) => {
  const startTimeMinutes = parseTimeToMinutes(startTime);
  const endTimeMinutes = parseTimeToMinutes(endTime);

  if (startTimeMinutes === null) {
    return null;
  }

  return existingBookings.find((booking) => {
    if (String(booking.id) === String(ignoredBookingId)) {
      return false;
    }

    const existingStartTimeMinutes = parseTimeToMinutes(booking.startTime);
    const existingEndTimeMinutes = parseTimeToMinutes(booking.endTime);

    if (
      existingStartTimeMinutes === null ||
      existingEndTimeMinutes === null ||
      existingStartTimeMinutes >= existingEndTimeMinutes
    ) {
      return false;
    }

    if (endTime && endTimeMinutes !== null && startTimeMinutes < endTimeMinutes) {
      return (
        startTimeMinutes < existingEndTimeMinutes &&
        endTimeMinutes > existingStartTimeMinutes
      );
    }

    return (
      startTimeMinutes >= existingStartTimeMinutes &&
      startTimeMinutes < existingEndTimeMinutes
    );
  }) || null;
};

export const getNextAvailableSlot = ({
  startTime = '',
  endTime = '',
  existingBookings = [],
  availabilityStart = '',
  availabilityEnd = '',
  ignoredBookingId = null,
}) => {
  const requestedStartMinutes = parseTimeToMinutes(startTime);
  const requestedEndMinutes = parseTimeToMinutes(endTime);
  const availabilityStartMinutes = parseTimeToMinutes(availabilityStart);
  const availabilityEndMinutes = parseTimeToMinutes(availabilityEnd);

  if (requestedStartMinutes === null) {
    return null;
  }

  const requestedDuration =
    requestedEndMinutes !== null && requestedStartMinutes < requestedEndMinutes
      ? requestedEndMinutes - requestedStartMinutes
      : DEFAULT_BOOKING_DURATION_MINUTES;

  if (requestedDuration <= 0) {
    return null;
  }

  let candidateStartMinutes = requestedStartMinutes;

  if (
    availabilityStartMinutes !== null &&
    candidateStartMinutes < availabilityStartMinutes
  ) {
    candidateStartMinutes = availabilityStartMinutes;
  }

  const normalizedBookings = existingBookings
    .filter((booking) => String(booking.id) !== String(ignoredBookingId))
    .map((booking) => ({
      startMinutes: parseTimeToMinutes(booking.startTime),
      endMinutes: parseTimeToMinutes(booking.endTime),
    }))
    .filter(
      (booking) =>
        booking.startMinutes !== null &&
        booking.endMinutes !== null &&
        booking.startMinutes < booking.endMinutes
    )
    .sort((leftBooking, rightBooking) => leftBooking.startMinutes - rightBooking.startMinutes);

  for (const existingBooking of normalizedBookings) {
    const candidateEndMinutes = candidateStartMinutes + requestedDuration;

    if (candidateEndMinutes <= existingBooking.startMinutes) {
      break;
    }

    if (
      candidateStartMinutes < existingBooking.endMinutes &&
      candidateEndMinutes > existingBooking.startMinutes
    ) {
      candidateStartMinutes = existingBooking.endMinutes;
    }
  }

  for (const existingBooking of normalizedBookings) {
    const candidateEndMinutes = candidateStartMinutes + requestedDuration;

    if (candidateEndMinutes <= existingBooking.startMinutes) {
      break;
    }

    if (
      candidateStartMinutes < existingBooking.endMinutes &&
      candidateEndMinutes > existingBooking.startMinutes
    ) {
      candidateStartMinutes = existingBooking.endMinutes;
    }
  }

  const candidateEndMinutes = candidateStartMinutes + requestedDuration;

  if (
    availabilityEndMinutes !== null &&
    candidateEndMinutes > availabilityEndMinutes
  ) {
    return null;
  }

  return {
    startTime: formatMinutesToTimeString(candidateStartMinutes),
    endTime: formatMinutesToTimeString(candidateEndMinutes),
  };
};
