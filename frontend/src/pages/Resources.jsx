import { useEffect, useState } from "react";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
} from "../utils/api";

const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE", "INACTIVE"];

const pageStyles = {
  minHeight: "100vh",
  padding: "32px 20px 64px",
  color: "#f8fafc",
  background:
    "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 24%), linear-gradient(180deg, #06131f 0%, #0d1b2a 50%, #132238 100%)",
};

const containerStyles = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "grid",
  gap: "24px",
};

const cardStyles = {
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "24px",
  boxShadow: "0 24px 60px rgba(2, 8, 23, 0.28)",
  backdropFilter: "blur(16px)",
};

const fieldStyles = {
  width: "100%",
  background: "rgba(10, 18, 32, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  color: "#e2e8f0",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyles = {
  background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
  color: "#04111d",
  border: "none",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyles = {
  background: "rgba(15, 23, 42, 0.9)",
  color: "#dbeafe",
  border: "1px solid rgba(96, 165, 250, 0.24)",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyles = {
  background: "rgba(127, 29, 29, 0.18)",
  color: "#fecaca",
  border: "1px solid rgba(248, 113, 113, 0.25)",
  borderRadius: "999px",
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <span
        style={{
          color: "#7dd3fc",
          fontSize: "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ margin: 0, fontSize: "24px", color: "#f8fafc" }}>{title}</h2>
      <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 600 }}>{label}</span>
      {children}
      {error && (
        <span style={{ color: "#fda4af", fontSize: "13px", lineHeight: 1.4 }}>{error}</span>
      )}
    </label>
  );
}

function StatusBadge({ status }) {
  const badgeMap = {
    ACTIVE: {
      background:
        "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 184, 166, 0.32) 100%)",
      color: "#ecfdf5",
      border: "1px solid rgba(110, 231, 183, 0.35)",
      boxShadow: "0 10px 24px rgba(16, 185, 129, 0.22)",
    },
    OUT_OF_SERVICE: {
      background: "rgba(248, 113, 113, 0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(248, 113, 113, 0.22)",
    },
    INACTIVE: {
      background: "rgba(148, 163, 184, 0.14)",
      color: "#cbd5e1",
      border: "1px solid rgba(148, 163, 184, 0.18)",
    },
  };

  const badgeStyle = badgeMap[status] || badgeMap.INACTIVE;

  return (
    <span
      style={{
        ...badgeStyle,
        borderRadius: "999px",
        padding: status === "ACTIVE" ? "7px 12px 7px 10px" : "6px 10px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {status === "ACTIVE" && (
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#f0fdf4",
            boxShadow: "0 0 0 4px rgba(240, 253, 244, 0.12)",
          }}
        />
      )}
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Resources() {
  const emptyForm = {
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    availabilityDate: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    description: "",
  };

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    location: "",
    capacity: "",
    availabilityDate: "",
    availabilityStart: "",
    availabilityEnd: "",
  });

  const activeCount = resources.filter((resource) => resource.status === "ACTIVE").length;
  const outOfServiceCount = resources.filter(
    (resource) => resource.status === "OUT_OF_SERVICE"
  ).length;
  const inactiveCount = resources.filter((resource) => resource.status === "INACTIVE").length;

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResources();
      setResources(response.data);
    } catch (err) {
      setError("Failed to load resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value : value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
     }));
    };  

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.capacity !== "" && Number(filters.capacity) < 0) {
        setError("Minimum capacity cannot be less than 0.");
        setLoading(false);
        return;
      }
      if (filters.capacity !== "") params.capacity = Number(filters.capacity);
      if (filters.availabilityDate) {
        params.availabilityDate = filters.availabilityDate;
      }
      if (filters.availabilityStart) {
        params.availabilityStart = filters.availabilityStart;
      }
      if (filters.availabilityEnd) {
        params.availabilityEnd = filters.availabilityEnd;
      }

      const response = await searchResources(params);
      setResources(response.data);
    } catch (err) {
      setError("Failed to search resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setFilters({
      type: "",
      status: "",
      location: "",
      capacity: "",
      availabilityDate: "",
      availabilityStart: "",
      availabilityEnd: "",
    });
    await loadResources();
  };

  const validateForm = () => {
    const nextErrors = {};
    const isEquipment = form.type === "EQUIPMENT";

    if (!form.name.trim()) {
      nextErrors.name = "Resource name is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.availabilityDate) {
      nextErrors.availabilityDate = "Availability date is required.";
    }

    if (!form.availabilityStart) {
      nextErrors.availabilityStart = "Availability start time is required.";
    }

    if (!form.availabilityEnd) {
      nextErrors.availabilityEnd = "Availability end time is required.";
    }

    if (
      form.availabilityStart &&
      form.availabilityEnd &&
      form.availabilityStart >= form.availabilityEnd
    ) {
      nextErrors.availabilityEnd =
        "Availability end time must be later than the start time.";
    }

    if (form.capacity !== "" && Number(form.capacity) < 0) {
      nextErrors.capacity = "Capacity cannot be less than 0.";
    } else if (!isEquipment && form.capacity === "") {
      nextErrors.capacity = "Capacity is required for lecture halls, labs, and meeting rooms.";
    } else if (!isEquipment && Number(form.capacity) === 0) {
      nextErrors.capacity =
        "Capacity must be greater than 0 for lecture halls, labs, and meeting rooms.";
    }

    return nextErrors;
  };

  const getSaveErrorMessage = (err) => {
    const responseData = err.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors.join(", ");
    }

    return "Failed to save resource";
  };

  const getSaveFieldErrors = (err) => {
    const responseErrors = err.response?.data?.errors;
    if (!responseErrors || Array.isArray(responseErrors)) {
      return {};
    }

    const nextErrors = { ...responseErrors };

    if (responseErrors.resource || responseErrors.availabilityWindowValid) {
      nextErrors.availabilityEnd =
        responseErrors.resource || responseErrors.availabilityWindowValid;
      delete nextErrors.resource;
      delete nextErrors.availabilityWindowValid;
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError("Please fix the highlighted form errors.");
      return;
    }

    const payload = {
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };

    try {
      setError("");
      setFormErrors({});

      if (editingId) {
        await updateResource(editingId, payload);
      } else {
        await createResource(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadResources();
    } catch (err) {
      const backendFieldErrors = getSaveFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFormErrors(backendFieldErrors);
      }
      setError(getSaveErrorMessage(err));
      console.error(err);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setFormErrors({});
    setError("");
    setForm({
      name: resource.name || "",
      type: resource.type || "LECTURE_HALL",
      capacity: resource.capacity ?? "",
      location: resource.location || "",
      availabilityDate: resource.availabilityDate || "",
      availabilityStart: resource.availabilityStart || "",
      availabilityEnd: resource.availabilityEnd || "",
      status: resource.status || "ACTIVE",
      description: resource.description || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;

    try {
      setError("");
      await deleteResource(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadResources();
    } catch (err) {
      setError("Failed to delete resource");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setError("");
  };

  return (
    <div style={pageStyles}>
      <div style={containerStyles}>
        <section
          style={{
            ...cardStyles,
            padding: "28px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-80px auto auto -60px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(34, 197, 94, 0.14)",
              filter: "blur(12px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto -60px -80px auto",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(56, 189, 248, 0.12)",
              filter: "blur(10px)",
            }}
          />
          <div style={{ position: "relative", display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.1 }}>
                Smart Resource Catalogue
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: "760px",
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                  fontSize: "16px",
                }}
              >
                Manage lecture halls, labs, meeting rooms, and equipment with clean
                search, clear availability windows, and a more polished operations
                dashboard.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.72) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Total Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px" }}>
                  {resources.length}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  All rooms and equipment currently available in your resource catalogue.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(74, 222, 128, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Active Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#dcfce7" }}>
                  {activeCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Ready to use right now for normal operations and bookings.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(248, 113, 113, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Out of Service</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#fecaca" }}>
                  {outOfServiceCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Temporarily unavailable resources that may need repair or maintenance.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(148, 163, 184, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Inactive Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#e2e8f0" }}>
                  {inactiveCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Resources kept in the system but currently not open for active use.
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            style={{
              ...cardStyles,
              padding: "16px 18px",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              background: "rgba(69, 10, 10, 0.72)",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <section style={{ ...cardStyles, padding: "24px", display: "grid", gap: "20px" }}>
            <SectionTitle
              eyebrow="Discover"
              title="Search and filter resources"
              description="Narrow the catalogue by type, status, location, or minimum capacity without leaving the page."
            />

            <div style={{ display: "grid", gap: "16px" }}>
              <Field label="Resource Type">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                >
                  <option value="">All Types</option>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                >
                  <option value="">All Statuses</option>
                  {resourceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Location">
                <input
                  name="location"
                  placeholder="Search by location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                />
              </Field>

              <Field label="Minimum Capacity">
                <input
                  name="capacity"
                  type="number"
                  placeholder="Minimum capacity"
                  min="0"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                />
              </Field>

              <Field label="Availability Date">
                <input
                  name="availabilityDate"
                  type="date"
                  value={filters.availabilityDate}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field label="Available From">
                  <input
                    name="availabilityStart"
                    type="time"
                    value={filters.availabilityStart}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available Until">
                  <input
                    name="availabilityEnd"
                    type="time"
                    value={filters.availabilityEnd}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" onClick={handleSearch} style={primaryButtonStyles}>
                Search Resources
              </button>
              <button type="button" onClick={handleResetFilters} style={secondaryButtonStyles}>
                Reset Filters
              </button>
            </div>
          </section>

          <section style={{ ...cardStyles, padding: "24px", display: "grid", gap: "20px" }}>
            <SectionTitle
              eyebrow={editingId ? "Edit" : "Create"}
              title={editingId ? "Update a resource" : "Add a new resource"}
              description="Keep the catalogue complete with location, capacity, status, and availability windows."
            />

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <Field label="Resource Name" error={formErrors.name}>
                <input
                  name="name"
                  placeholder="Resource name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={fieldStyles}
                />
              </Field>

              <Field label="Type">
                <select name="type" value={form.type} onChange={handleChange} style={fieldStyles}>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field
                  label={
                    form.type === "EQUIPMENT"
                      ? "Capacity (optional for equipment)"
                      : "Capacity"
                  }
                  error={formErrors.capacity}
                >
                  <input
                    name="capacity"
                    type="number"
                    placeholder={
                      form.type === "EQUIPMENT"
                        ? "Optional, use 0 if not applicable"
                        : "Capacity"
                    }
                    min="0"
                    value={form.capacity}
                    onChange={handleChange}
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Location" error={formErrors.location}>
                  <input
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field label="Availability Date" error={formErrors.availabilityDate}>
                  <input
                    name="availabilityDate"
                    type="date"
                    value={form.availabilityDate}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available From" error={formErrors.availabilityStart}>
                  <input
                    name="availabilityStart"
                    type="time"
                    value={form.availabilityStart}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available Until" error={formErrors.availabilityEnd}>
                  <input
                    name="availabilityEnd"
                    type="time"
                    value={form.availabilityEnd}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={fieldStyles}
                >
                  {resourceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  placeholder="Short description about the resource"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  style={{ ...fieldStyles, resize: "vertical", minHeight: "120px" }}
                />
              </Field>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" style={primaryButtonStyles}>
                  {editingId ? "Update Resource" : "Add Resource"}
                </button>

                {editingId && (
                  <button type="button" onClick={handleCancel} style={secondaryButtonStyles}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        <section style={{ ...cardStyles, padding: "24px", display: "grid", gap: "22px" }}>
          <SectionTitle
            eyebrow="Catalogue"
            title="All resources"
            description="A quick operational view of every resource currently available in the system."
          />

          {loading ? (
            <div style={{ color: "#93c5fd", fontSize: "15px" }}>Loading resources...</div>
          ) : resources.length === 0 ? (
            <div
              style={{
                padding: "26px",
                borderRadius: "18px",
                border: "1px dashed rgba(148, 163, 184, 0.22)",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              No resources found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
              }}
            >
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(12, 18, 32, 0.92) 100%)",
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                    borderRadius: "22px",
                    padding: "20px",
                    display: "grid",
                    gap: "16px",
                    boxShadow: "0 18px 40px rgba(2, 8, 23, 0.22)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "20px", color: "#f8fafc" }}>
                        {resource.name}
                      </h3>
                      <div style={{ marginTop: "8px", color: "#7dd3fc", fontSize: "13px" }}>
                        {resource.type.replaceAll("_", " ")}
                      </div>
                    </div>
                    <StatusBadge status={resource.status} />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "16px",
                        background: "rgba(30, 41, 59, 0.62)",
                      }}
                    >
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>Capacity</div>
                      <div style={{ marginTop: "6px", fontWeight: 700 }}>
                        {resource.capacity ?? "N/A"}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "16px",
                        background: "rgba(30, 41, 59, 0.62)",
                      }}
                    >
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>Availability Date</div>
                      <div style={{ marginTop: "6px", fontWeight: 700 }}>
                        {resource.availabilityDate || "Not set"}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "16px",
                        background: "rgba(30, 41, 59, 0.62)",
                      }}
                    >
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>Availability Time</div>
                      <div style={{ marginTop: "6px", fontWeight: 700 }}>
                        {resource.availabilityStart || "--:--"} - {resource.availabilityEnd || "--:--"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>Location</span>
                      <div style={{ marginTop: "4px", color: "#e2e8f0" }}>{resource.location}</div>
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>Description</span>
                      <div style={{ marginTop: "4px", color: "#cbd5e1", lineHeight: 1.6 }}>
                        {resource.description || "No description provided."}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => handleEdit(resource)} style={secondaryButtonStyles}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(resource.id)} style={dangerButtonStyles}>
                      Delete
                    </button>
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

export default Resources;
