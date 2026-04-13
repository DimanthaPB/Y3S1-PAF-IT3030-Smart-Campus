import AttachmentList from "../Attachment/AttachmentList";

function TicketCard({ ticket }) {
  return (
    <div
      style={{
        border: "1px solid #444",
        margin: "15px",
        padding: "15px",
        borderRadius: "10px",
        background: "#0f172a",
        color: "white"
      }}
    >
      {/* 🔹 Ticket Details */}
      <h3>{ticket.title}</h3>
      <p>{ticket.description}</p>

      <p>
        <strong>Category:</strong> {ticket.category}
      </p>

      <p>
        <strong>Priority:</strong> {ticket.priority}
      </p>

      <p>
        <strong>Status:</strong> {ticket.status}
      </p>

      {/* 🔥 ATTACHMENTS (SAFE WAY) */}
      <div style={{ marginTop: "10px" }}>
        <AttachmentList ticketId={ticket.id} />
      </div>
    </div>
  );
}

export default TicketCard;