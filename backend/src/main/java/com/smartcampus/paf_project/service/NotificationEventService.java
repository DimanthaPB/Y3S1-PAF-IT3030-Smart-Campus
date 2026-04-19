package com.smartcampus.paf_project.service;

import com.smartcampus.paf_project.models.Notification;
import com.smartcampus.paf_project.models.NotificationPreference;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.NotificationPreferenceRepository;
import com.smartcampus.paf_project.repositories.NotificationRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationEventService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final UserRepository userRepository;

    public NotificationEventService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository notificationPreferenceRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.userRepository = userRepository;
    }

    public void notifyBookingEvent(String recipientEmail, String message, Long bookingId) {
        findUserByEmail(recipientEmail).ifPresent(user -> {
            boolean enabled = notificationPreferenceRepository.findByUserId(user.getId())
                    .map(NotificationPreference::isReceiveBookingAlerts)
                    .orElse(true);

            if (enabled) {
                saveNotification(user, message, "BOOKING", bookingId);
            }
        });
    }

    public void notifyTicketEventByUserId(Long recipientUserId, String message, Long ticketId) {
        findUserById(recipientUserId).ifPresent(user -> {
            boolean enabled = notificationPreferenceRepository.findByUserId(user.getId())
                    .map(NotificationPreference::isReceiveTicketAlerts)
                    .orElse(true);

            if (enabled) {
                saveNotification(user, message, "TICKET", ticketId);
            }
        });
    }

    public void notifyTicketEventByEmail(String recipientEmail, String message, Long ticketId) {
        findUserByEmail(recipientEmail).ifPresent(user -> {
            boolean enabled = notificationPreferenceRepository.findByUserId(user.getId())
                    .map(NotificationPreference::isReceiveTicketAlerts)
                    .orElse(true);

            if (enabled) {
                saveNotification(user, message, "TICKET", ticketId);
            }
        });
    }

    private Optional<User> findUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email.trim());
    }

    private Optional<User> findUserById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return userRepository.findById(id);
    }

    private void saveNotification(User user, String message, String type, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }
}
