import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import TicketForm from "./TicketForm";
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

function TicketList({ refreshKey = 0 }) {
  const [tickets, setTickets] = useState([]);
  const [resourcesById, setResourcesById] = useState({});
  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const closedCount = tickets.filter(
    (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
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

  const handleTicketCreated = (newTicket) => {
    setTickets((current) => sortTickets([newTicket, ...current]));
  };

  return (
    <div className="ticket-page">
      <section className="ticket-hero">
        <p className="ticket-eyebrow">Incident Support Desk</p>
        <h1 className="ticket-page-title">My Tickets</h1>
        <p className="ticket-page-subtitle">
          Report issues, attach evidence, and track progress from open incidents to
          final resolution in one workspace.
        </p>
      </section>

      <section className="ticket-stats-grid">
        <article className="ticket-stat-card ticket-stat-card-primary">
          <p className="ticket-stat-label">Total Tickets</p>
          <h2 className="ticket-stat-value">{tickets.length}</h2>
          <p className="ticket-stat-meta">All incidents you have submitted to the platform.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-open">
          <p className="ticket-stat-label">Open</p>
          <h2 className="ticket-stat-value">{openCount}</h2>
          <p className="ticket-stat-meta">New issues waiting for progress updates.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-progress">
          <p className="ticket-stat-label">In Progress</p>
          <h2 className="ticket-stat-value">{inProgressCount}</h2>
          <p className="ticket-stat-meta">Tickets currently being worked on by the admin team.</p>
        </article>
        <article className="ticket-stat-card ticket-stat-card-closed">
          <p className="ticket-stat-label">Resolved / Closed</p>
          <h2 className="ticket-stat-value">{closedCount}</h2>
          <p className="ticket-stat-meta">Incidents that already reached a final outcome.</p>
        </article>
      </section>

      <TicketForm onTicketCreated={handleTicketCreated} />

      <section className="ticket-section">
        <h2 className="ticket-section-title">Submitted Tickets</h2>
        {tickets.length === 0 ? (
          <p className="ticket-empty-state">No tickets found</p>
        ) : (
          <div className="ticket-list-stack">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                currentUser={getCurrentUserEmail()}
                resourcesById={resourcesById}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TicketList;
