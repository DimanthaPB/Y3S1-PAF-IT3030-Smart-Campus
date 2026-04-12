import { useEffect, useState } from "react";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
} from "../utils/api";

function Resources() {
  const emptyForm = {
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    status: "ACTIVE",
    description: "",
  };

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
  type: "",
  status: "",
  location: "",
  capacity: "",
});

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
    if (filters.capacity) params.capacity = Number(filters.capacity);

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
  });
  await loadResources();
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };

    try {
      setError("");

      if (editingId) {
        await updateResource(editingId, payload);
      } else {
        await createResource(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadResources();
    } catch (err) {
      setError("Failed to save resource");
      console.error(err);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name || "",
      type: resource.type || "LECTURE_HALL",
      capacity: resource.capacity ?? "",
      location: resource.location || "",
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
  };

  return (
    <div style={{ padding: "24px", color: "white" }}>
      <h1>Resources Management</h1>

      {error && (
        <div style={{ marginBottom: "16px", color: "#ff8a8a" }}>{error}</div>
      )}

      <div
  style={{
    display: "grid",
    gap: "12px",
    maxWidth: "500px",
    marginBottom: "24px",
    background: "#1f2d4a",
    padding: "20px",
    borderRadius: "12px",
  }}
>
  <h2>Search / Filter Resources</h2>

  <select name="type" value={filters.type} onChange={handleFilterChange}>
    <option value="">All Types</option>
    <option value="LECTURE_HALL">LECTURE_HALL</option>
    <option value="LAB">LAB</option>
    <option value="MEETING_ROOM">MEETING_ROOM</option>
    <option value="EQUIPMENT">EQUIPMENT</option>
  </select>

  <select name="status" value={filters.status} onChange={handleFilterChange}>
    <option value="">All Statuses</option>
    <option value="ACTIVE">ACTIVE</option>
    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
    <option value="INACTIVE">INACTIVE</option>
  </select>

  <input
    name="location"
    placeholder="Search by location"
    value={filters.location}
    onChange={handleFilterChange}
  />

  <input
    name="capacity"
    type="number"
    placeholder="Minimum capacity"
    value={filters.capacity}
    onChange={handleFilterChange}
  />

  <div style={{ display: "flex", gap: "10px" }}>
    <button type="button" onClick={handleSearch}>
      Search
    </button>
    <button type="button" onClick={handleResetFilters}>
      Reset
    </button>
  </div>
</div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "500px",
          marginBottom: "32px",
          background: "#18233a",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <input
          name="name"
          placeholder="Resource name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange}>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="LAB">LAB</option>
          <option value="MEETING_ROOM">MEETING_ROOM</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>

        <input
          name="capacity"
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows="4"
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit">
            {editingId ? "Update Resource" : "Add Resource"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>All Resources</h2>

      {loading ? (
        <p>Loading...</p>
      ) : resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {resources.map((resource) => (
            <div
              key={resource.id}
              style={{
                background: "#18233a",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #2a3655",
              }}
            >
              <h3>{resource.name}</h3>
              <p><strong>Type:</strong> {resource.type}</p>
              <p><strong>Capacity:</strong> {resource.capacity}</p>
              <p><strong>Location:</strong> {resource.location}</p>
              <p><strong>Status:</strong> {resource.status}</p>
              <p><strong>Description:</strong> {resource.description}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button onClick={() => handleEdit(resource)}>Edit</button>
                <button onClick={() => handleDelete(resource.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resources;