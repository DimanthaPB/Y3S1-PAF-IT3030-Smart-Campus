package com.smartcampus.paf_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
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
    public Ticket createTicket(@Valid @RequestBody TicketCreateRequest request) {
        return ticketService.createTicket(request);
    }

    // GET all tickets
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    // GET by ID
    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
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

}
