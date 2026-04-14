import { useEffect, useState } from "react";
import axios from "axios";
import AttachmentList from "../Attachment/AttachmentList";
import CommentSection from "../Comment/CommentSection";
import "../../styles/TicketManagement.css";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const TECHNICIAN_OPTIONS = ["", "Tech1", "Tech2", "Tech3"];
const STATUS_BADGE_CLASS = {
  OPEN: "ticket-badge ticket-badge-status-open",
  IN_PROGRESS: "ticket-badge ticket-badge-status-in-progress",
  RESOLVED: "ticket-badge ticket-badge-status-resolved",
  CLOSED: "ticket-badge ticket-badge-status-closed",
  REJECTED: "ticket-badge ticket-badge-status-rejected"
};
const PRIORITY_BADGE_CLASS = {
  LOW: "ticket-badge ticket-badge-priority-low",
  MEDIUM: "ticket-badge ticket-badge-priority-medium",
  HIGH: "ticket-badge ticket-badge-priority-high"
};

function TicketCard({
  ticket,
  canUploadAttachments = true,
  canDeleteAttachments = true,
  canEditStatus = false,
  canAssignTechnician = false,
  canSetRejected = false,
  onTicketUpdated,
  onStatusChanged,
  currentUser = "User1",
  resourcesById = {}
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);
  const [currentAttachmentCount, setCurrentAttachmentCount] = useState(0);
  const [statusValue, setStatusValue] = useState(ticket.status || "OPEN");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [assignedToValue, setAssignedToValue] = useState(ticket.assignedTo || "");
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

  useEffect(() => {
    setStatusValue(ticket.status || "OPEN");
  }, [ticket.status]);

  useEffect(() => {
    setAssignedToValue(ticket.assignedTo || "");
  }, [ticket.assignedTo]);

  const visibleStatusOptions = canSetRejected
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((status) => status !== "REJECTED");
  const selectedResourceName = ticket.resourceId
    ? resourcesById[String(ticket.resourceId)] || `Resource #${ticket.resourceId}`
    : "N/A";
  const remainingAttachmentSlots = Math.max(0, 3 - currentAttachmentCount);

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

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const hasInvalidFile = files.some((file) => !isAllowedImage(file));
    if (hasInvalidFile) {
      setUploadError("Only JPG and PNG images are allowed.");
      setSelectedFiles([]);
      return;
    }

    if (files.length > remainingAttachmentSlots) {
      setUploadError(
        `You can upload only ${remainingAttachmentSlots} more image(s).`
      );
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select image files");
      return;
    }

    setUploadError("");

    axios
      .get(`http://localhost:8080/api/attachments/ticket/${ticket.id}`)
      .then((countRes) => {
        const currentCount = (countRes.data || []).length;
        if (currentCount + selectedFiles.length > 3) {
          setUploadError(
            `Upload limit exceeded. You can upload ${
              3 - currentCount
            } more image(s).`
          );
          return;
        }

        const uploadRequests = selectedFiles.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          return axios.post(
            `http://localhost:8080/api/attachments/upload/${ticket.id}`,
            formData
          );
        });

        Promise.all(uploadRequests)
          .then(() => {
            alert("File(s) uploaded successfully");
            setSelectedFiles([]);
            setAttachmentRefreshKey((currentKey) => currentKey + 1);
          })
          .catch((err) => {
            console.error("Upload error:", err);
            alert("Upload failed");
          });
      })
      .catch((err) => {
        console.error("Attachment count fetch error:", err);
        alert("Unable to validate attachment limit");
      });
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusValue(newStatus);
    setIsUpdatingStatus(true);

    try {
      const res = await axios.put(
        `http://localhost:8080/api/tickets/${ticket.id}/status`,
        { status: newStatus }
      );

      if (onTicketUpdated) {
        onTicketUpdated(res.data);
      }
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
      setStatusValue(ticket.status || "OPEN");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignmentChange = async (e) => {
    const newAssignedTo = e.target.value;
    setAssignedToValue(newAssignedTo);
    setIsUpdatingAssignment(true);

    try {
      const res = await axios.put(
        `http://localhost:8080/api/tickets/${ticket.id}/assignment`,
        { assignedTo: newAssignedTo }
      );

      if (onTicketUpdated) {
        onTicketUpdated(res.data);
      }
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (err) {
      console.error("Assignment update error:", err);
      alert("Failed to update technician assignment");
      setAssignedToValue(ticket.assignedTo || "");
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  return (
    <div className="ticket-card">
      <h3 className="ticket-title">{ticket.title}</h3>
      <p className="ticket-description">{ticket.description}</p>

      <div className="ticket-meta">
        <p className="ticket-meta-item">
          <strong>Category:</strong> {ticket.category || "N/A"}
        </p>
        <p className="ticket-meta-item">
          <strong>Priority:</strong>{" "}
          <span className={PRIORITY_BADGE_CLASS[ticket.priority] || "ticket-badge"}>
            {ticket.priority || "N/A"}
          </span>
        </p>
        <p className="ticket-meta-item">
          <strong>Status:</strong>{" "}
          <span className={STATUS_BADGE_CLASS[ticket.status] || "ticket-badge"}>
            {ticket.status || "OPEN"}
          </span>
        </p>
        <p className="ticket-meta-item">
          <strong>Assigned To:</strong> {ticket.assignedTo || "Unassigned"}
        </p>
        <p className="ticket-meta-item">
          <strong>Resource:</strong> {selectedResourceName}
        </p>
      </div>

      {canEditStatus && (
        <div className="ticket-status-row">
          <label>
            <strong>Update Status:</strong>
          </label>
          <select
            value={statusValue}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            className="status-select"
          >
            {visibleStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}

      {canAssignTechnician && (
        <div className="ticket-status-row">
          <label>
            <strong>Assign Technician:</strong>
          </label>
          <select
            value={assignedToValue}
            onChange={handleAssignmentChange}
            disabled={isUpdatingAssignment}
            className="status-select"
          >
            <option value="">Unassigned</option>
            {TECHNICIAN_OPTIONS.filter(Boolean).map((technician) => (
              <option key={technician} value={technician}>
                {technician}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="attachment-section">
        <AttachmentList
          ticketId={ticket.id}
          refreshKey={attachmentRefreshKey}
          canDelete={canDeleteAttachments}
          onCountChange={setCurrentAttachmentCount}
        />
      </div>

      {canUploadAttachments && (
        <div className="ticket-actions-row">
          <p className="attachment-limit-info">
            {`Uploaded: ${currentAttachmentCount}/3. You can upload ${remainingAttachmentSlots} more image(s).`}
          </p>
          <input
            className="ticket-file-input"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple
            disabled={remainingAttachmentSlots === 0}
            onChange={handleFileSelection}
          />

          {selectedFiles.length > 0 && (
            <p className="selected-files-text">
              Selected: {selectedFiles.map((file) => file.name).join(", ")}
            </p>
          )}
          {uploadError && <p className="attachment-error-text">{uploadError}</p>}

          <button
            type="button"
            onClick={handleUpload}
            className="btn btn-upload"
            disabled={remainingAttachmentSlots === 0 || selectedFiles.length === 0}
          >
            Upload
          </button>
        </div>
      )}

      <CommentSection ticketId={ticket.id} currentUser={currentUser} />
    </div>
  );
}

export default TicketCard;
