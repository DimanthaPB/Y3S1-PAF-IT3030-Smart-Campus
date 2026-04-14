package com.smartcampus.paf_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.repositories.TicketRepository;

@Service
public class TicketService {
    private static final Set<String> ALLOWED_STATUSES =
            Set.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public Ticket updateTicketStatus(Long id, String status) {
        if (status == null || !ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status value");
        }

        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketAssignment(Long id, String assignedTo) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setAssignedTo(assignedTo == null ? null : assignedTo.trim());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}
