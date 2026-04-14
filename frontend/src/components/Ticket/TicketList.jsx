import { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";
import TicketForm from "./TicketForm";
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

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/resources")
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
      <h1 className="ticket-page-title">Support Desk</h1>
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
                currentUser="User1"
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
