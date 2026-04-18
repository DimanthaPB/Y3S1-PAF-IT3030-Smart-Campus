import { useEffect, useMemo, useState } from 'react';
import { getResources } from '../utils/api';

const resourceTypeLabels = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

const pageStyles = {
  page: {
    minHeight: '100vh',
    padding: '32px 20px 64px',
    color: '#f8fafc',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: '24px',
  },
  hero: {
    background:
      'radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.14), transparent 26%), rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 24px 60px rgba(2, 8, 23, 0.28)',
    backdropFilter: 'blur(16px)',
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: '12px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.4rem)',
    lineHeight: 1.05,
  },
  description: {
    margin: '16px 0 0',
    color: '#cbd5e1',
    maxWidth: '760px',
    lineHeight: 1.7,
    fontSize: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '22px',
    padding: '20px',
    boxShadow: '0 20px 40px rgba(2, 8, 23, 0.18)',
  },
  filterCard: {
    background: 'rgba(15, 23, 42, 0.78)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '24px',
    padding: '24px',
    display: 'grid',
    gap: '18px',
    boxShadow: '0 20px 40px rgba(2, 8, 23, 0.18)',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  input: {
    width: '100%',
    background: 'rgba(8, 15, 28, 0.88)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    color: '#e2e8f0',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  resourceCard: {
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.72) 100%)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '24px',
    padding: '22px',
    display: 'grid',
    gap: '16px',
    boxShadow: '0 24px 46px rgba(2, 8, 23, 0.2)',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(34, 197, 94, 0.18)',
    border: '1px solid rgba(110, 231, 183, 0.28)',
    color: '#ecfdf5',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  metaCard: {
    background: 'rgba(8, 15, 28, 0.62)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '16px',
    padding: '12px 14px',
  },
  emptyState: {
    background: 'rgba(15, 23, 42, 0.74)',
    border: '1px dashed rgba(148, 163, 184, 0.28)',
    borderRadius: '24px',
    padding: '28px',
    color: '#cbd5e1',
    textAlign: 'center',
  },
};

const defaultFilters = {
  query: '',
  type: '',
  location: '',
  minCapacity: '',
};

function formatResourceType(type) {
  return resourceTypeLabels[type] || type?.replaceAll('_', ' ') || 'Resource';
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return 'Not specified';
  }

  if (startDate && endDate) {
    return `${startDate} to ${endDate}`;
  }

  return startDate || endDate;
}

function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) {
    return 'Not specified';
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || endTime;
}

function UserResources() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getResources();
        setResources(response.data || []);
      } catch (err) {
        console.error('Failed to load resource catalogue:', err);
        setError('Failed to load the resource catalogue.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const minCapacity = Number(filters.minCapacity);

    return resources.filter((resource) => {
      const matchesQuery =
        !normalizedQuery ||
        [resource.name, resource.location, resource.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesType = !filters.type || resource.type === filters.type;
      const matchesLocation =
        !filters.location ||
        (resource.location || '')
          .toLowerCase()
          .includes(filters.location.trim().toLowerCase());
      const matchesCapacity =
        !filters.minCapacity ||
        (Number.isFinite(minCapacity) &&
          Number(resource.capacity || 0) >= minCapacity);

      return matchesQuery && matchesType && matchesLocation && matchesCapacity;
    });
  }, [filters, resources]);

  const resourceTypes = useMemo(
    () => [...new Set(resources.map((resource) => resource.type).filter(Boolean))],
    [resources]
  );

  const totalCapacity = filteredResources.reduce(
    (sum, resource) => sum + Number(resource.capacity || 0),
    0
  );

  const resetFilters = () => setFilters(defaultFilters);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <section style={pageStyles.hero}>
          <div style={pageStyles.eyebrow}>User Resource Catalogue</div>
          <h1 style={pageStyles.title}>Browse active rooms and equipment</h1>
          <p style={pageStyles.description}>
            Explore currently available campus spaces and equipment before you book.
            Search by keyword, narrow by type or location, and compare capacity and
            availability details in one place.
          </p>
        </section>

        <section style={pageStyles.statsGrid}>
          <div style={pageStyles.statCard}>
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>Active Resources</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{resources.length}</div>
          </div>
          <div style={pageStyles.statCard}>
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>Matching Results</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{filteredResources.length}</div>
          </div>
          <div style={pageStyles.statCard}>
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>Visible Capacity</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalCapacity}</div>
          </div>
        </section>

        <section style={pageStyles.filterCard}>
          <div>
            <div style={pageStyles.eyebrow}>Search and Filter</div>
            <h2 style={{ margin: '6px 0 0', fontSize: '1.5rem' }}>Find the right resource</h2>
          </div>

          <div style={pageStyles.filterGrid}>
            <label>
              <div style={{ marginBottom: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                Search
              </div>
              <input
                name="query"
                value={filters.query}
                onChange={handleFilterChange}
                placeholder="Search by name, location, or description"
                style={pageStyles.input}
              />
            </label>

            <label>
              <div style={{ marginBottom: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                Type
              </div>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                style={pageStyles.input}
              >
                <option value="">All active resources</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatResourceType(type)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div style={{ marginBottom: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                Location
              </div>
              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Search by building or area"
                style={pageStyles.input}
              />
            </label>

            <label>
              <div style={{ marginBottom: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                Minimum Capacity
              </div>
              <input
                name="minCapacity"
                type="number"
                min="0"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                placeholder="e.g. 20"
                style={pageStyles.input}
              />
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                background: 'rgba(8, 15, 28, 0.84)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                color: '#e2e8f0',
                borderRadius: '999px',
                padding: '11px 16px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Reset Filters
            </button>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '18px' }}>
          <div style={pageStyles.resultsHeader}>
            <div>
              <div style={pageStyles.eyebrow}>Catalogue Results</div>
              <h2 style={{ margin: '6px 0 0', fontSize: '1.5rem' }}>
                {loading ? 'Loading resources...' : `Showing ${filteredResources.length} resources`}
              </h2>
            </div>
          </div>

          {error ? (
            <div style={pageStyles.emptyState}>{error}</div>
          ) : loading ? (
            <div style={pageStyles.emptyState}>Loading active resources...</div>
          ) : filteredResources.length === 0 ? (
            <div style={pageStyles.emptyState}>
              No active resources match your current filters.
            </div>
          ) : (
            <div style={pageStyles.resourceGrid}>
              {filteredResources.map((resource) => (
                <article key={resource.id} style={pageStyles.resourceCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ color: '#7dd3fc', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                        {formatResourceType(resource.type)}
                      </div>
                      <h3 style={{ margin: '8px 0 0', fontSize: '1.35rem' }}>{resource.name}</h3>
                    </div>
                    <span style={pageStyles.chip}>Active</span>
                  </div>

                  <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>
                    {resource.description || 'No additional description is available for this resource.'}
                  </p>

                  <div style={pageStyles.metaGrid}>
                    <div style={pageStyles.metaCard}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                        Location
                      </div>
                      <div style={{ fontWeight: 700 }}>{resource.location || 'Not specified'}</div>
                    </div>
                    <div style={pageStyles.metaCard}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                        Capacity
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {resource.capacity ? `${resource.capacity} people` : 'Not specified'}
                      </div>
                    </div>
                    <div style={pageStyles.metaCard}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                        Available Dates
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatDateRange(resource.availableFromDate, resource.availableToDate)}
                      </div>
                    </div>
                    <div style={pageStyles.metaCard}>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                        Daily Hours
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatTimeRange(resource.availabilityStart, resource.availabilityEnd)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserResources;
