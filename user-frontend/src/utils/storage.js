const PENDING_BOOKING_KEY = 'pendingBooking';

export const savePendingBooking = (data) => {
  try {
    localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving pending booking:', err);
  }
};

export const getPendingBooking = () => {
  try {
    const data = localStorage.getItem(PENDING_BOOKING_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error retrieving pending booking:', err);
    return null;
  }
};

export const clearPendingBooking = () => {
  try {
    localStorage.removeItem(PENDING_BOOKING_KEY);
  } catch (err) {
    console.error('Error clearing pending booking:', err);
  }
};
