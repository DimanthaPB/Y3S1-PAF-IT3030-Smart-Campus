import { useEffect, useState } from "react";
import api, { BACKEND_BASE_URL } from "../../utils/api";
import "../../styles/TicketManagement.css";

function AttachmentList({
  ticketId,
  refreshKey = 0,
  canDelete = true,
  onCountChange
}) {
  const [attachments, setAttachments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .get(`/attachments/ticket/${ticketId}`)
      .then((res) => {
        setAttachments(res.data || []);
      })
      .catch((err) => console.error("Attachment error:", err));
  }, [ticketId, refreshKey]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(attachments.length);
    }
  }, [attachments.length, onCountChange]);

  const handleDelete = (attachmentId, filePath) => {
    const imageUrl = `${BACKEND_BASE_URL}/${filePath}`;
    setDeletingId(attachmentId);

    api
      .delete(`/attachments/${attachmentId}`)
      .then(() => {
        setAttachments((current) =>
          current.filter((att) => att.id !== attachmentId)
        );

        if (selectedImage === imageUrl) {
          setSelectedImage(null);
        }
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("Delete failed");
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  return (
    <div className="attachment-section">
      <h4>Attachments</h4>

      {attachments.length === 0 ? (
        <p className="attachment-empty-text">No attachments</p>
      ) : (
        <div className="attachment-grid">
          {attachments.map((att) =>
          (
            <div key={att.id} className="attachment-item">
              <img
                src={`${BACKEND_BASE_URL}/${encodeURI(att.filePath)}`}
                alt={att.fileName}
                className="attachment-image"
                onClick={() =>
                  setSelectedImage(`${BACKEND_BASE_URL}/${encodeURI(att.filePath)}`)
                }
              />

              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(att.id, att.filePath)}
                  disabled={deletingId === att.id}
                  className="btn btn-delete"
                >
                  {deletingId === att.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-content"
          onClick={(e) => e.stopPropagation()}
          >
            <span className="modal-close" onClick={() => setSelectedImage(null)}>
              X
            </span>

            <img src={selectedImage} alt="Preview" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentList;
