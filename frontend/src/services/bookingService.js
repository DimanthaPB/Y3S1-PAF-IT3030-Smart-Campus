import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/bookings';

export const createBooking = async (bookingData) => {
  return await axios.post(API_BASE_URL, bookingData);
};

export const getBookings = async (filters = {}) => {
  return await axios.get(API_BASE_URL, {
    params: filters,
  });
};

export const approveBooking = async (bookingId) => {
  return await axios.put(`${API_BASE_URL}/${bookingId}/approve`);
};

export const rejectBooking = async (bookingId, reason) => {
  return await axios.put(`${API_BASE_URL}/${bookingId}/reject`, null, {
    params: { reason },
  });
};

export const cancelBooking = async (bookingId, reason) => {
  return await axios.put(`${API_BASE_URL}/${bookingId}/cancel`, null, {
    params: { reason },
  });
};