package com.smartcampus.paf_project.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.paf_project.models.Attachment;
import com.smartcampus.paf_project.models.Ticket;
import com.smartcampus.paf_project.repositories.AttachmentRepository;
import com.smartcampus.paf_project.repositories.TicketRepository;
import com.smartcampus.paf_project.service.FileService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

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

        String filePath = fileService.saveFile(file);

        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();

        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(filePath);
        attachment.setTicket(ticket);

        return attachmentRepository.save(attachment);

    }

    @GetMapping("/ticket/{ticketId}")
    public List<Attachment> getAttachmentsByTicket(@PathVariable Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

}