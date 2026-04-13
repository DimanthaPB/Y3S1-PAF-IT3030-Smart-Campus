/*import { useEffect, useState } from "react";
import axios from "axios";

function AttachmentList({ ticketId }) {
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/attachments/ticket/${ticketId}`)
      .then((res) => {
        setAttachments(res.data || []);
      })
      .catch((err) => {
        console.error("Attachment error:", err);
      });
  }, [ticketId]);

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Attachments</h4>

      {attachments.length === 0 ? (
        <p>No attachments</p>
      ) : (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {attachments.map((att) => (
            <a
              key={att.id}
              href={`http://localhost:8080/${att.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
  src={`http://localhost:8080/${att.filePath}`}
  alt={att.fileName}
  style={{
    width: "200px",
    borderRadius: "8px",
    border: "1px solid #555",
    cursor: "pointer",
    transition: "0.3s"
  }}
  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
/>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttachmentList;*/


import { useEffect, useState } from "react";
import axios from "axios";

function AttachmentList({ ticketId }) {
  const [attachments, setAttachments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/attachments/ticket/${ticketId}`)
      .then((res) => {
        setAttachments(res.data || []);
      })
      .catch((err) => console.error("Attachment error:", err));
  }, [ticketId]);

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Attachments</h4>

      {attachments.length === 0 ? (
        <p>No attachments</p>
      ) : (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {attachments.map((att) => (
            <img
              key={att.id}
              src={`http://localhost:8080/${att.filePath}`}
              alt={att.fileName}
              style={{
                width: "200px",
                borderRadius: "8px",
                border: "1px solid #555",
                cursor: "pointer",
                transition: "0.3s"
              }}
              onClick={() =>
                setSelectedImage(`http://localhost:8080/${att.filePath}`)
              }
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          ))}
        </div>
      )}

      {/* 🔥 IMAGE MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div style={{ position: "relative" }}>
            {/* ❌ CLOSE BUTTON */}
            <span
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "white",
                color: "black",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                textAlign: "center",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              ✕
            </span>

            {/* IMAGE */}
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: "10px"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentList;