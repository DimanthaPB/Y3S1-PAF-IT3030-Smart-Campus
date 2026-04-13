import { useState } from "react";
import axios from "axios";
import "../../styles/TicketManagement.css";

const initialForm = {
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM"
};

function TicketForm({ onTicketCreated }) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        priority: formData.priority
      };

      const res = await axios.post("http://localhost:8080/api/tickets", payload);
      if (onTicketCreated) {
        onTicketCreated(res.data);
      }
      setFormData(initialForm);
    } catch (err) {
      console.error("Create ticket error:", err);
      alert("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h3 className="ticket-form-title">Add New Ticket</h3>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-title">
          Title
        </label>
        <input
          id="ticket-title"
          type="text"
          name="title"
          placeholder="Enter ticket title"
          value={formData.title}
          onChange={handleChange}
          required
          className="ticket-input"
        />
      </div>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-description">
          Description
        </label>
        <textarea
          id="ticket-description"
          name="description"
          placeholder="Describe the issue"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="ticket-textarea"
        />
      </div>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-category">
          Category
        </label>
        <input
          id="ticket-category"
          type="text"
          name="category"
          placeholder="e.g. IT, Facility, Network"
          value={formData.category}
          onChange={handleChange}
          className="ticket-input"
        />
      </div>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-priority">
          Priority
        </label>
        <select
          id="ticket-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="ticket-select"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div className="ticket-form-actions">
        <button type="submit" disabled={isSubmitting} className="btn btn-upload">
          {isSubmitting ? "Creating..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}

export default TicketForm;
