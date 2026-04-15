function BookingFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '1.5rem',
        borderRadius: '8px',
      }}
    >
      <h2>Filter Bookings</h2>

      <form onSubmit={handleSearch}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Status</label>
          <input
            type="text"
            name="status"
            value={filters.status}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Booked By</label>
          <input
            type="text"
            name="bookedBy"
            value={filters.bookedBy}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Facility Name</label>
          <input
            type="text"
            name="facilityName"
            value={filters.facilityName}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Booking Date</label>
          <input
            type="date"
            name="bookingDate"
            value={filters.bookingDate}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit">Search</button>
      </form>
    </div>
  );
}

export default BookingFilters;