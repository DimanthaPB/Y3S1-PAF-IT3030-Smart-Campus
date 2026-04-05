package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.models.Notification;
import com.smartcampus.paf_project.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 1. CREATE - අලුත් Notification එකක් හැදීම
    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationRepository.save(notification);
    }

    // 2. READ - සියලුම Notifications හෝ අදාළ User ගේ ඒවා බැලීම
    @GetMapping
    public List<Notification> getAllNotifications(@RequestParam(required = false) String email) {
        if (email != null) {
            return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
        }
        return notificationRepository.findAll();
    }

    // 3. UPDATE - Notification එකක් කියෙව්වා කියලා Mark කිරීම
    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // 4. DELETE - Notification එකක් අයින් කිරීම
    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return "Notification deleted successfully!";
    }
}