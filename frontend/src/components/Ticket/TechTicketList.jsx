import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import { getCurrentUserEmail } from "../../utils/auth";
import api from "../../utils/api";
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
  const [resourcesById, setResourcesById] = useState({});
  const currentUser = getCurrentUserEmail();
  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const actionedCount = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED" ||
      ticket.status === "REJECTED"
  ).length;

  const fetchTickets = () => {
    api
      .get("/tickets")
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

  useEffect(() => {
    api
      .get("/resources")
      .then((res) => {
        const resourceMap = (res.data || []).reduce((acc, resource) => {
          acc[String(resource.id)] = resource.name;
          return acc;
        }, {});
        setResourcesById(resourceMap);
      })
      .catch((err) => {
        console.error("Resource fetch error:", err);
      });
  }, []);

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
      <section className="ticket-hero">
        <p className="ticket-eyebrow">Admin Ticket Console</p>
        <h1 className="ticket-page-title">Manage Incident Tickets</h1>
        <p className="ticket-page-subtitle">
          Review every submitted incident, update ticket status, and keep the support
          workflow moving with clearer visibility across the backlog.
        </p>
      </section>

      <section className="ticket-stats-grid">
        <article className="ticket-stat-card ticket-stat-card-primary">
          <p className="ticket-stat-label">Total Tickets</p>
          <h2 className="ticket-stat-value">{tickets.length}</h2>
          <p className="ticket-stat-meta">All incidents currently available to admin review.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-open">
          <p className="ticket-stat-label">Open</p>
          <h2 className="ticket-stat-value">{openCount}</h2>
          <p className="ticket-stat-meta">Fresh tickets that still need action.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-progress">
          <p className="ticket-stat-label">In Progress</p>
          <h2 className="ticket-stat-value">{inProgressCount}</h2>
          <p className="ticket-stat-meta">Issues actively being investigated or resolved.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-closed">
          <p className="ticket-stat-label">Actioned</p>
          <h2 className="ticket-stat-value">{actionedCount}</h2>
          <p className="ticket-stat-meta">Resolved, closed, or rejected tickets.</p>
        </article>
      </section>

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
                canSetRejected
                onTicketUpdated={handleTicketUpdated}
                onStatusChanged={handleStatusUpdated}
                currentUser={currentUser}
                resourcesById={resourcesById}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TechTicketList;
