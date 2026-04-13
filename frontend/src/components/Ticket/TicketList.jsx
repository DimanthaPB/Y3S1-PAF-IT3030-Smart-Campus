import { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";

function TicketList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
  axios.get("http://localhost:8080/api/tickets")
    .then(res => {
      console.log("DATA:", res.data);
      setTickets(res.data);
    })
    .catch(err => {
      console.error("ERROR:", err); // ✅ ONLY here
    });
}, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tickets</h1>

      {tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))
      )}
    </div>
  );
}

export default TicketList;