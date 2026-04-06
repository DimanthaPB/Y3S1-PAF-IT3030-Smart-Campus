package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.models.Notification;
import com.smartcampus.paf_project.models.NotificationPreference;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.NotificationPreferenceRepository;
import com.smartcampus.paf_project.repositories.NotificationRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                  NotificationPreferenceRepository preferenceRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(Principal principal) {
        if (principal == null) throw new RuntimeException("Unauthorized");
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(Principal principal) {
        User user = getUserByEmail(principal);
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/me/notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Principal principal) {
        User user = getUserByEmail(principal);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        notification.setRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @DeleteMapping("/me/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Principal principal) {
        User user = getUserByEmail(principal);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        notificationRepository.delete(notification);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/preferences")
    public ResponseEntity<NotificationPreference> getPreferences(Principal principal) {
        User user = getUserByEmail(principal);
        NotificationPreference prefs = preferenceRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
        return ResponseEntity.ok(prefs);
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<NotificationPreference> updatePreferences(Principal principal, @RequestBody Map<String, Boolean> payload) {
        User user = getUserByEmail(principal);
        NotificationPreference prefs = preferenceRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Preferences not found"));

        if (payload.containsKey("receiveBookingAlerts")) prefs.setReceiveBookingAlerts(payload.get("receiveBookingAlerts"));
        if (payload.containsKey("receiveTicketAlerts")) prefs.setReceiveTicketAlerts(payload.get("receiveTicketAlerts"));
        if (payload.containsKey("receiveSystemAlerts")) prefs.setReceiveSystemAlerts(payload.get("receiveSystemAlerts"));

        return ResponseEntity.ok(preferenceRepository.save(prefs));
    }
}