package com.smartcampus.paf_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.paf_project.models.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
