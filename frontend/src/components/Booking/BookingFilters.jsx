function BookingFilters({ filters, setFilters, filteredCount, totalCount }) {
  const inputStyles = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.85rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '14px',
    color: '#ffffff',
    outline: 'none',
  };

  const selectStyles = {
    ...inputStyles,
    paddingRight: '2.8rem',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
    backgroundPosition:
      'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
  };

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

  const handleClearFilters = () => {
    setFilters({
      status: '',
      facilityName: '',
      bookingDate: '',
      sortBy: 'latest',
    });
  };

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '28px',
        padding: '2rem',
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
      }}
    >
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: '700',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#7dd3fc',
          marginBottom: '0.8rem',
        }}
      >
        Discover
      </div>

      <h2
        style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#ffffff',
          marginBottom: '0.75rem',
        }}
      >
        Search and Filter My Bookings
      </h2>

      <p
        style={{
          color: '#cbd5e1',
          marginBottom: '2rem',
          fontSize: '1rem',
          lineHeight: '1.7',
        }}
      >
        Quickly find bookings by status, facility, or booking date.
      </p>

      <p
        style={{
          marginTop: '0.5rem',
          marginBottom: '1.5rem',
          color: '#cbd5e1',
          fontSize: '0.95rem',
        }}
      >
        Showing {filteredCount} of {totalCount} bookings
      </p>

      <form onSubmit={handleSearch}>
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <label
                style={{
                  display: 'block',
                  color: '#dbe4f0',
                  fontWeight: '600',
                  marginBottom: '0.65rem',
                }}
              >
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                style={selectStyles}
              >
                <option
                  value=""
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                >
                  All Statuses
                </option>
                <option
                  value="PENDING"
                  style={{ backgroundColor: '#0f172a', color: '#fde68a' }}
                >
                  Pending
                </option>
                <option
                  value="APPROVED"
                  style={{ backgroundColor: '#0f172a', color: '#86efac' }}
                >
                  Approved
                </option>
                <option
                  value="REJECTED"
                  style={{ backgroundColor: '#0f172a', color: '#fca5a5' }}
                >
                  Rejected
                </option>
                <option
                  value="CANCELLED"
                  style={{ backgroundColor: '#0f172a', color: '#d1d5db' }}
                >
                  Cancelled
                </option>
              </select>
            </div>

            <div style={{ minWidth: 0 }}>
              <label
                style={{
                  display: 'block',
                  color: '#dbe4f0',
                  fontWeight: '600',
                  marginBottom: '0.65rem',
                }}
              >
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
                style={selectStyles}
              >
                <option
                  value="latest"
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                >
                  Latest to Oldest
                </option>
                <option
                  value="oldest"
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                >
                  Oldest to Latest
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
            <label
              style={{
                display: 'block',
                color: '#dbe4f0',
                fontWeight: '600',
                marginBottom: '0.65rem',
              }}
            >
              Facility Name
            </label>
            <input
              type="text"
              name="facilityName"
              value={filters.facilityName}
              onChange={handleChange}
              style={inputStyles}
            />
          </div>

            <div style={{ minWidth: 0 }}>
              <label
                style={{
                  display: 'block',
                  color: '#dbe4f0',
                  fontWeight: '600',
                  marginBottom: '0.65rem',
                }}
              >
                Booking Date
              </label>
              <input
                type="date"
                name="bookingDate"
                value={filters.bookingDate}
                onChange={handleChange}
                style={inputStyles}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="submit"
            style={{
              padding: '0.85rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              background: 'rgba(59, 130, 246, 0.20)',
              color: '#dbeafe',
              cursor: 'pointer',
              fontWeight: '700',
              transition: '0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.30)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.20)';
            }}
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '0.85rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '700',
              transition: '0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.14)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingFilters;
