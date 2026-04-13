import { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";
import "../../styles/TicketManagement.css";

const sortTickets = (ticketList = []) =>
  [...ticketList].sort((a, b) => {
    const createdAtA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdAtB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (createdAtA !== createdAtB) {
      return createdAtB - createdAtA;
    }

    return (b?.id || 0) - (a?.id || 0);
  });

function TechTicketList({ refreshKey = 0, onTicketRefresh }) {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = () => {
    axios
      .get("http://localhost:8080/api/tickets")
      .then((res) => {
        setTickets(sortTickets(res.data || []));
      })
      .catch((err) => {
        console.error("ERROR:", err);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshKey]);

  const handleTicketUpdated = (updatedTicket) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  };

  const handleStatusUpdated = () => {
    if (onTicketRefresh) {
      onTicketRefresh();
    }
  };

  return (
    <div className="ticket-page">
      <section className="ticket-section">
        <h2 className="ticket-section-title">Ticket Management</h2>
        {tickets.length === 0 ? (
          <p className="ticket-empty-state">No tickets found</p>
        ) : (
          <div className="ticket-list-stack">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                canUploadAttachments={false}
                canDeleteAttachments={false}
                canEditStatus
                onTicketUpdated={handleTicketUpdated}
                onStatusChanged={handleStatusUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TechTicketList;
