package com.smartcampus.paf_project.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.paf_project.models.Attachment;


public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicketId(Long ticketId);
    long countByTicketId(Long ticketId);
}


