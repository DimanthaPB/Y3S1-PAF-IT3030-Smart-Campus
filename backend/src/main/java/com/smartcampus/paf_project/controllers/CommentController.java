package com.smartcampus.paf_project.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.paf_project.models.Comment;
import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.repositories.CommentRepository;
import com.smartcampus.paf_project.repositories.TicketRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping
    public List<Comment> getTicketComments(@PathVariable Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @PostMapping
    public Comment addComment(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> payload) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();

        String text = payload.get("text");
        String createdBy = payload.get("createdBy");
        if (text == null || text.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment text is required");
        }
        if (createdBy == null || createdBy.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdBy is required");
        }

        Comment comment = new Comment();
        comment.setText(text.trim());
        comment.setCreatedBy(createdBy.trim());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setTicket(ticket);
        return commentRepository.save(comment);
    }

    @PutMapping("/{commentId}")
    public Comment updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestBody Map<String, String> payload) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        validateCommentOwnership(ticketId, comment, payload.get("actingUser"));

        String text = payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment text is required");
        }

        comment.setText(text.trim());
        return commentRepository.save(comment);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestParam("actingUser") String actingUser) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        validateCommentOwnership(ticketId, comment, actingUser);
        commentRepository.delete(comment);
    }

    private void validateCommentOwnership(Long ticketId, Comment comment, String actingUser) {
        if (comment.getTicket() == null || !ticketId.equals(comment.getTicket().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment does not belong to this ticket");
        }

        if (actingUser == null || actingUser.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "actingUser is required");
        }

        if (!comment.getCreatedBy().equals(actingUser.trim())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the comment owner can modify this comment");
        }
    }
}
