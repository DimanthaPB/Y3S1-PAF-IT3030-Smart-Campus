package com.smartcampus.paf_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import com.smartcampus.paf_project.dto.TicketCreateRequest;
import com.smartcampus.paf_project.dto.TicketStatusUpdateRequest;
import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.service.TicketService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public Ticket createTicket(@Valid @RequestBody TicketCreateRequest request, Authentication authentication) {
        return ticketService.createTicket(request, authentication.getName());
    }

    // GET all tickets
    @GetMapping
    public List<Ticket> getAllTickets(Authentication authentication) {
        return ticketService.getAllTickets(isAdmin(authentication), authentication.getName());
    }

    // GET by ID
    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id, Authentication authentication) {
        return ticketService.getTicketById(id, isAdmin(authentication), authentication.getName());
    }

    
    @PutMapping("/{id}/status")
public Ticket updateTicketStatus(
        @PathVariable Long id,
        @Valid @RequestBody TicketStatusUpdateRequest request) {

    return ticketService.updateTicketStatus(
        id,
        request.getStatus(),
        request.getResolutionNotes()
    );
}

    

    @PutMapping("/{id}/assignment")
    public Ticket updateTicketAssignment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        return ticketService.updateTicketAssignment(id, payload.get("assignedTo"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

}
