import { useEffect, useState } from "react";
import AttachmentList from "../Attachment/AttachmentList";
import CommentSection from "../Comment/CommentSection";
import api from "../../utils/api";
import "../../styles/TicketManagement.css";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
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
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [resolutionNotesValue, setResolutionNotesValue] = useState(
    ticket.resolutionNotes || ""
  );

  useEffect(() => {
    setStatusValue(ticket.status || "OPEN");
  }, [ticket.status]);

  useEffect(() => {
    setResolutionNotesValue(ticket.resolutionNotes || "");
  }, [ticket.resolutionNotes]);

  const visibleStatusOptions = canSetRejected
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((status) => status !== "REJECTED");
  const selectedResourceName = ticket.resourceId
    ? resourcesById[String(ticket.resourceId)] || `Resource #${ticket.resourceId}`
    : "N/A";
  const remainingAttachmentSlots = Math.max(0, 3 - currentAttachmentCount);
  const shouldShowResolutionNotesInput =
    canEditStatus &&
    ["IN_PROGRESS", "RESOLVED", "CLOSED"].includes(statusValue);
  const requiresResolutionNotes = statusValue === "RESOLVED" || statusValue === "CLOSED";

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
      setUploadError("Invalid file type");
      setSelectedFiles([]);
      return;
    }

    if (files.length > remainingAttachmentSlots) {
      setUploadError("Max 3 images allowed");
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

    api
      .get(`/attachments/ticket/${ticket.id}`)
      .then((countRes) => {
        const currentCount = (countRes.data || []).length;
        if (currentCount + selectedFiles.length > 3) {
          setUploadError("Max 3 images allowed");
          return;
        }

        const uploadRequests = selectedFiles.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          return api.post(
            `/attachments/upload/${ticket.id}`,
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
            setUploadError(extractApiErrorMessage(err, "Upload failed"));
          });
      })
      .catch((err) => {
        console.error("Attachment count fetch error:", err);
        setUploadError(extractApiErrorMessage(err, "Unable to validate attachment limit"));
      });
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const latestNotes =
      document.getElementById(`resolution-notes-${ticket.id}`)?.value || "";

    if (
      (newStatus === "RESOLVED" || newStatus === "CLOSED") &&
      !latestNotes.trim()
    ) {
      setStatusUpdateError(
        "Resolution notes are required when status is set to RESOLVED or CLOSED"
      );
      return;
    }

    setStatusValue(newStatus);
    setIsUpdatingStatus(true);
    setStatusUpdateError("");

    try {
      const res = await api.put(
        `/tickets/${ticket.id}/status`,
        {
          status: newStatus,
          resolutionNotes: latestNotes.trim() || null
        }
      );

      if (onTicketUpdated) {
        onTicketUpdated(res.data);
      }
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (err) {
      console.error("Status update error:", err);
      setStatusUpdateError(
        extractApiErrorMessage(err, "Failed to update status")
      );
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
          <strong>Assigned To:</strong> {ticket.assignedTo || "Not assigned"}
        </p>
        <p className="ticket-meta-item">
          <strong>Resource:</strong> {selectedResourceName}
        </p>
        <p className="ticket-meta-item">
          <strong>Preferred Contact:</strong> {ticket.contactDetails || "N/A"}
        </p>
      </div>

      {ticket.resolutionNotes && !canEditStatus && (
        <p className="ticket-meta-item">
          <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
        </p>
      )}

      {canEditStatus && (
        <div className="ticket-status-row">
          <label>
            <strong>Assign Technician:</strong>
          </label>

          <select
            value={ticket.assignedTo || ""}
              onChange={async (e) => {
              const newAssignee = e.target.value;

                try {
                  const res = await api.put(`/tickets/${ticket.id}/assignment`, {
                    assignedTo: newAssignee || null
                  });

                  if (onTicketUpdated) {
                    onTicketUpdated(res.data);
                  }
                } catch (err) {
                  console.error("Assign error:", err);
                  alert("Failed to assign technician");
                }
              }}
              className="status-select"
            >
              <option value="">Not assigned</option>
              <option value="Technician 1">Technician1</option>
              <option value="Technician 2">Technician2</option>
              <option value="Technician 3">Technician3</option>
            </select>
          </div>
        )}

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

      {statusUpdateError && !shouldShowResolutionNotesInput && (
        <p className="attachment-error-text">{statusUpdateError}</p>
      )}

      {shouldShowResolutionNotesInput && (
        <div className="ticket-form-row">
          <label className="ticket-form-label" htmlFor={`resolution-notes-${ticket.id}`}>
            Resolution Notes
          </label>
          <textarea
            id={`resolution-notes-${ticket.id}`}
            className="ticket-textarea"
            rows={3}
            value={resolutionNotesValue}
            onChange={(e) => {
              setResolutionNotesValue(e.target.value);
              if (statusUpdateError) {
                setStatusUpdateError("");
              }
            }}
            placeholder="Add resolution details"
          />
          {requiresResolutionNotes && !resolutionNotesValue.trim() && (
            <p className="attachment-error-text">
              Resolution notes are required for RESOLVED/CLOSED status
            </p>
          )}
          {statusUpdateError && (
            <p className="attachment-error-text">{statusUpdateError}</p>
          )}
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
