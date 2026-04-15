export const getAuthTokenPayload = () => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Failed to decode auth token:', error);
    return null;
  }
};

export const getCurrentUserEmail = () => {
  const payload = getAuthTokenPayload();
  return payload?.sub || payload?.email || '';
};

export const getCurrentUserRole = () => {
  const payload = getAuthTokenPayload();
  return payload?.role || '';
};

export const isAdminUser = () => getCurrentUserRole() === 'ADMIN';
