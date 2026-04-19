package com.smartcampus.paf_project.controllers;

import java.util.List;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.paf_project.models.Attachment;
import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.repositories.AttachmentRepository;
import com.smartcampus.paf_project.repositories.TicketRepository;
import com.smartcampus.paf_project.service.FileService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {
    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;

    @Autowired
    private FileService fileService;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @PostMapping("/upload/{ticketId}")
    public Attachment uploadFile(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equalsIgnoreCase("image/jpeg") ||
                  contentType.equalsIgnoreCase("image/jpg") ||
                  contentType.equalsIgnoreCase("image/png"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file type. Only image/jpeg, image/jpg, image/png are allowed");
        }

        long currentCount = attachmentRepository.countByTicketId(ticketId);
        if (currentCount >= MAX_ATTACHMENTS_PER_TICKET) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum 3 attachments allowed");
        }

        String filePath = fileService.saveFile(file);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        String originalName = file.getOriginalFilename() == null ? "upload-image" : file.getOriginalFilename();
        String safeFileName = Paths.get(originalName).getFileName().toString();

        Attachment attachment = new Attachment();
        attachment.setFileName(safeFileName);
        attachment.setFilePath(filePath);
        attachment.setTicket(ticket);

        return attachmentRepository.save(attachment);

    }

    @GetMapping("/ticket/{ticketId}")
    public List<Attachment> getAttachmentsByTicket(@PathVariable Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    @DeleteMapping("/{attachmentId}")
    public void deleteAttachment(@PathVariable Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId).orElseThrow();
        fileService.deleteFile(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

}
