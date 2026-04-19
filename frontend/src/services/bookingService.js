import api from '../utils/api';

const API_BASE_URL = '/bookings';

export const createBooking = async (bookingData) => {
  return await api.post(API_BASE_URL, bookingData);
};

export const getBookings = async (filters = {}) => {
  return await api.get(API_BASE_URL, {
    params: filters,
  });
};

export const getBookingConflicts = async (filters = {}) => {
  return await api.get(`${API_BASE_URL}/conflicts`, {
    params: filters,
  });
};

export const approveBooking = async (bookingId, reason) => {
  return await api.put(`${API_BASE_URL}/${bookingId}/approve`, null, {
    params: { reason },
  });
};

export const rejectBooking = async (bookingId, reason) => {
  return await api.put(`${API_BASE_URL}/${bookingId}/reject`, null, {
    params: { reason },
  });
};

export const cancelBooking = async (bookingId, reason) => {
  return await api.put(`${API_BASE_URL}/${bookingId}/cancel`, null, {
    params: { reason },
  });
};

export const updateBooking = async (bookingId, bookingData) => {
  return await api.put(`${API_BASE_URL}/${bookingId}`, bookingData);
};

export const deleteBooking = async (bookingId) => {
  return await api.delete(`${API_BASE_URL}/${bookingId}`);
};
