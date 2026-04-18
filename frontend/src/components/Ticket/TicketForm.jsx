import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../styles/TicketManagement.css";

const initialForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  contactDetails: ""
};

function TicketForm({ onTicketCreated }) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/resources")
      .then((res) => {
        setResources(res.data || []);
      })
      .catch((err) => {
        console.error("Resource fetch error:", err);
      });
  }, []);

  const getResourceCategory = (resource) =>
    resource?.category || resource?.type || "UNCATEGORIZED";

  const categories = useMemo(() => {
    const categorySet = new Set(
      resources
        .map((resource) => getResourceCategory(resource))
        .filter((category) => Boolean(category))
    );
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const filteredResources = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      const resourceCategory = getResourceCategory(resource);
      const matchesCategory = selectedCategory
        ? resourceCategory === selectedCategory
        : false;
      const matchesSearch = normalizedSearchTerm
        ? (resource.name || "").toLowerCase().includes(normalizedSearchTerm)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, searchTerm]);

  const selectedResource = resources.find(
    (resource) => String(resource.id) === String(selectedResourceId)
  );

  useEffect(() => {
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const isAllowedImage = (file) => {
    if (!file) {
      return false;
    }
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    return (
      type === "image/jpeg" ||
      type === "image/jpg" ||
      type === "image/png" ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png")
    );
  };


const isValidContactDetails = (value) => {
  const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phonePattern = /^[0-9]{10}$/; 
  return emailPattern.test(value) || phonePattern.test(value);
};

const validateContact = (value) => {
  const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phonePattern = /^[0-9]{10}$/; 
  if (!value.trim()) {
    return "Preferred contact is required";
  }

  if (!emailPattern.test(value) && !phonePattern.test(value)) {
    return "Enter a valid email or a 10-digit phone number";
  }

  return "";
};

  const extractApiErrorMessage = (error, fallbackMessage) => {
    const data = error?.response?.data;
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (data?.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors).find(
        (message) => typeof message === "string" && message.trim()
      );
      if (firstError) {
        return firstError;
      }
    }
    return fallbackMessage;
  };

  const handleFileSelection = (e) => {
  const files = Array.from(e.target.files || []);
  setSubmitError("");

  if (files.length === 0) return;

  if (selectedFiles.length + files.length > 3) {
    setFileError("You can only upload up to 3 images per ticket");
    return;
  }

  if (files.some((file) => !isAllowedImage(file))) {
    setFileError("Invalid file type");
    return;
  }

  setFileError("");

  setSelectedFiles((prev) => [...prev, ...files]);

};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmitError("");
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError("Title and description are required");
      return;
    }

    if (!selectedCategory) {
      setSubmitError("Please select a resource category");
      return;
    }

    if (!selectedResourceId) {
      setSubmitError("Please select a resource");
      return;
    }

    const normalizedContactDetails = formData.contactDetails.trim();
    if (!normalizedContactDetails) {
      setSubmitError("Preferred contact is required");
      return;
    }

    if (!isValidContactDetails(normalizedContactDetails)) {
      setSubmitError("Preferred contact must be a valid email or phone number");
      return;
    }

    if (fileError) {
      setSubmitError(fileError);
      return;
    }

    if (selectedFiles.length > 3) {
      setFileError("Max 3 images allowed");
      return;
    }

    if (selectedFiles.some((file) => !isAllowedImage(file))) {
      setFileError("Invalid file type");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: selectedCategory,
        priority: formData.priority,
        resourceId: Number(selectedResourceId),
        contactDetails: normalizedContactDetails
      };

      const res = await axios.post("http://localhost:8080/api/tickets", payload);
      const createdTicket = res.data;

      if (selectedFiles.length > 0 && createdTicket?.id) {
        await Promise.all(
          selectedFiles.map((file) => {
            const formDataForUpload = new FormData();
            formDataForUpload.append("file", file);
            return axios.post(
              `http://localhost:8080/api/attachments/upload/${createdTicket.id}`,
              formDataForUpload
            );
          })
        );
      }

      if (onTicketCreated) {
        onTicketCreated(createdTicket);
      }
      setFormData(initialForm);
      setSelectedCategory("");
      setSelectedResourceId("");
      setSearchTerm("");
      setSelectedFiles([]);
      setFileError("");
      setSubmitError("");
    } catch (err) {
      console.error("Create ticket error:", err);
      setSubmitError(
        extractApiErrorMessage(
          err,
          "Failed to create ticket or upload attachments"
        )
      );
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
        <label className="ticket-form-label" htmlFor="ticket-contact-details">
          Preferred Contact (email or phone)
        </label>
        <input
          id="ticket-contact-details"
          type="text"
          name="contactDetails"
          placeholder="example@domain.com or +94 77 123 4567"
          value={formData.contactDetails}
          onChange={(e) => {
            handleChange(e);
            if (contactError) {
              setContactError(validateContact(e.target.value));
            }
          }}
          onBlur={() => {
            setContactError(validateContact(formData.contactDetails));
          }}
          required
          className="ticket-input"
        />
      </div>

      {contactError && (
        <p className="attachment-error-text">{contactError}</p>
      )}

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-category-select">
          Resource Category
        </label>
        <select
          id="ticket-category-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedResourceId("");
            setSearchTerm("");
          }}
          className="ticket-select"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="resource-search-input">
          Resource
        </label>
        <select
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
          className="ticket-select resource-select"
          disabled={!selectedCategory}
        >
          <option value="">
            {selectedCategory ? "Select resource" : "Select category first"}
          </option>
          {filteredResources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
        {selectedCategory && filteredResources.length === 0 && (
          <p className="resource-empty-state">No results found</p>
        )}
        {selectedResource && (
          <p className="resource-selected-text">
            Selected: <strong>{selectedResource.name}</strong>
          </p>
        )}
      </div>

      <div className="ticket-form-row">
        <label className="ticket-form-label" htmlFor="ticket-attachments">
          Attachments (Maximum 3)
        </label>
        <input
          id="ticket-attachments"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          onChange={handleFileSelection}
          className="ticket-input"
        />
        <p className="attachment-limit-info">
          {`Selected: ${selectedFiles.length}/3 image(s)`}
        </p>
        {fileError && <p className="attachment-error-text">{fileError}</p>}

        {filePreviews.length > 0 && (
          <div className="ticket-file-preview-grid">
            {filePreviews.map((previewUrl, index) => (
              <div key={`${previewUrl}-${index}`} className="attachment-preview-wrapper">

              <img
                src={previewUrl}
                alt={`Attachment preview ${index + 1}`}
                className="ticket-file-preview-image"
              />

              <button
                type="button"
                className="attachment-remove-btn"
                onClick={() => {
                  setSelectedFiles((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                  setFileError(""); 
                }}
              >
                ×
              </button>

      </div>
    ))}
  </div>
)}

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
      {submitError && <p className="attachment-error-text">{submitError}</p>}
    </form>
  );
}

export default TicketForm;
