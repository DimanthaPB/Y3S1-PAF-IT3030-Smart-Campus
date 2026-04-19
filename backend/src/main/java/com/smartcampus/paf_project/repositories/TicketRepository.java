package com.smartcampus.paf_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.paf_project.models.Ticket;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByOrderByIdDesc(Long createdBy);
}
