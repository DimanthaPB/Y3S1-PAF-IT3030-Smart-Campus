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
      endTime &&
      parseTimeToMinutes(startTime) !== null &&
      parseTimeToMinutes(endTime) !== null &&
      parseTimeToMinutes(startTime) < parseTimeToMinutes(endTime)
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
