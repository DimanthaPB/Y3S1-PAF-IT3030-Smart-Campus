package com.smartcampus.paf_project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import com.smartcampus.paf_project.dto.TicketCreateRequest;
import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.repositories.TicketRepository;

@Service
public class TicketService {
    private static final Set<String> ALLOWED_STATUSES =
            Set.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
    private static final Set<String> ALLOWED_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^\\+?[0-9()\\-\\s]{7,20}$");

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket createTicket(TicketCreateRequest request) {
        String normalizedPriority = normalizeRequired(request.getPriority(), "Priority is required").toUpperCase();
        if (!ALLOWED_PRIORITIES.contains(normalizedPriority)) {
            throw new IllegalArgumentException("Invalid priority value");
        }

        String normalizedContact = normalizeRequired(request.getContactDetails(), "Contact details are required");
        if (!isValidContactDetails(normalizedContact)) {
            throw new IllegalArgumentException("Contact details must be a valid email or phone number");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(normalizeRequired(request.getTitle(), "Title is required"));
        ticket.setDescription(normalizeRequired(request.getDescription(), "Description is required"));
        ticket.setCategory(normalizeRequired(request.getCategory(), "Category is required"));
        ticket.setResourceId(request.getResourceId());
        ticket.setPriority(normalizedPriority);
        ticket.setContactDetails(normalizedContact);
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public Ticket updateTicketStatus(Long id, String status, String resolutionNotes) {
        String normalizedStatus = normalizeRequired(status, "Status is required").toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid status value");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        String normalizedNotes = normalizeOptional(resolutionNotes);
        if (normalizedNotes != null) {
            ticket.setResolutionNotes(normalizedNotes);
        }

        if ("RESOLVED".equals(normalizedStatus) || "CLOSED".equals(normalizedStatus)) {
            String effectiveNotes = normalizedNotes != null
                    ? normalizedNotes
                    : normalizeOptional(ticket.getResolutionNotes());
            if (effectiveNotes == null) {
                throw new IllegalArgumentException("Resolution notes are required when status is RESOLVED or CLOSED");
            }
            ticket.setResolutionNotes(effectiveNotes);
        }

        ticket.setStatus(normalizedStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketAssignment(Long id, String assignedTo) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        ticket.setAssignedTo(assignedTo == null ? null : assignedTo.trim());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    private String normalizeRequired(String value, String errorMessage) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException(errorMessage);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isValidContactDetails(String contactDetails) {
        return EMAIL_PATTERN.matcher(contactDetails).matches()
                || PHONE_PATTERN.matcher(contactDetails).matches();
    }
}
