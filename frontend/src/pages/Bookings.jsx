import { useState } from 'react';
import BookingForm from '../components/Booking/BookingForm';
import BookingFilters from '../components/Booking/BookingFilters';
import BookingList from '../components/Booking/BookingList';

function Bookings() {
  const [filters, setFilters] = useState({
    status: '',
    bookedBy: '',
    facilityName: '',
    bookingDate: '',
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <h1>Bookings</h1>

      <BookingForm onBookingCreated={handleBookingCreated} />

      <div style={{ marginTop: '2rem' }}>
        <BookingFilters filters={filters} setFilters={setFilters} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <BookingList filters={filters} refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Bookings;