import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/TicketManagement.css";

function AttachmentList({ ticketId, refreshKey = 0, canDelete = true }) {
  const [attachments, setAttachments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/attachments/ticket/${ticketId}`)
      .then((res) => {
        setAttachments(res.data || []);
      })
      .catch((err) => console.error("Attachment error:", err));
  }, [ticketId, refreshKey]);

  const handleDelete = (attachmentId, filePath) => {
    const imageUrl = `http://localhost:8080/${filePath}`;
    setDeletingId(attachmentId);

    axios
      .delete(`http://localhost:8080/api/attachments/${attachmentId}`)
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
          {attachments.map((att) => (
            <div key={att.id} className="attachment-item">
              <img
                src={`http://localhost:8080/${att.filePath}`}
                alt={att.fileName}
                className="attachment-image"
                onClick={() =>
                  setSelectedImage(`http://localhost:8080/${att.filePath}`)
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
          <div className="modal-content">
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
