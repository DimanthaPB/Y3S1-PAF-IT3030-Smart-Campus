package com.smartcampus.paf_project.repositories;

import com.smartcampus.paf_project.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // අදාළ User ගේ email එකට ආපු notification විතරක් ගන්න
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
}