import { useEffect, useState } from "react";
import axios from "axios";
import AttachmentList from "../Attachment/AttachmentList";
import "../../styles/TicketManagement.css";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "CLOSED"];
const STATUS_BADGE_CLASS = {
  OPEN: "ticket-badge ticket-badge-status-open",
  IN_PROGRESS: "ticket-badge ticket-badge-status-in-progress",
  CLOSED: "ticket-badge ticket-badge-status-closed"
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
  onTicketUpdated,
  onStatusChanged
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);
  const [statusValue, setStatusValue] = useState(ticket.status || "OPEN");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setStatusValue(ticket.status || "OPEN");
  }, [ticket.status]);

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post(
        `http://localhost:8080/api/attachments/upload/${ticket.id}`,
        formData
      )
      .then(() => {
        alert("File uploaded successfully");
        setSelectedFile(null);
        setAttachmentRefreshKey((currentKey) => currentKey + 1);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        alert("Upload failed");
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
          <span
            className={
              PRIORITY_BADGE_CLASS[ticket.priority] || "ticket-badge"
            }
          >
            {ticket.priority || "N/A"}
          </span>
        </p>
        <p className="ticket-meta-item">
          <strong>Status:</strong>{" "}
          <span className={STATUS_BADGE_CLASS[ticket.status] || "ticket-badge"}>
            {ticket.status || "OPEN"}
          </span>
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
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
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
        />
      </div>

      {canUploadAttachments && (
        <div className="ticket-actions-row">
          <input
            className="ticket-file-input"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <button type="button" onClick={handleUpload} className="btn btn-upload">
            Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketCard;
