package com.smartcampus.paf_project.service;

import com.smartcampus.paf_project.models.Notification;
import com.smartcampus.paf_project.models.NotificationPreference;
import com.smartcampus.paf_project.models.Role;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.NotificationPreferenceRepository;
import com.smartcampus.paf_project.repositories.NotificationRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
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
            boolean enabled = getOrCreatePreferences(user).isReceiveBookingAlerts();

            if (enabled) {
                saveNotification(user, message, "BOOKING", bookingId);
            }
        });
    }

    public void notifyTicketEventByUserId(Long recipientUserId, String message, Long ticketId) {
        findUserById(recipientUserId).ifPresent(user -> {
            boolean enabled = getOrCreatePreferences(user).isReceiveTicketAlerts();

            if (enabled) {
                saveNotification(user, message, "TICKET", ticketId);
            }
        });
    }

    public void notifyTicketEventByEmail(String recipientEmail, String message, Long ticketId) {
        findUserByEmail(recipientEmail).ifPresent(user -> {
            boolean enabled = getOrCreatePreferences(user).isReceiveTicketAlerts();

            if (enabled) {
                saveNotification(user, message, "TICKET", ticketId);
            }
        });
    }

    public void notifyAdminsAboutBooking(String message, Long bookingId) {
        notifyUsersByRole(Role.ADMIN, message, "BOOKING", bookingId, NotificationPreference::isReceiveBookingAlerts);
    }

    public void notifyAdminsAboutTicket(String message, Long ticketId) {
        notifyUsersByRole(Role.ADMIN, message, "TICKET", ticketId, NotificationPreference::isReceiveTicketAlerts);
    }

    public void notifyUsersAboutSystemEvent(String message, Long referenceId) {
        notifyUsersByRole(Role.USER, message, "SYSTEM", referenceId, NotificationPreference::isReceiveSystemAlerts);
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

    private NotificationPreference getOrCreatePreferences(User user) {
        return notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> notificationPreferenceRepository.save(
                        NotificationPreference.builder()
                                .user(user)
                                .receiveBookingAlerts(true)
                                .receiveTicketAlerts(true)
                                .receiveSystemAlerts(true)
                                .build()
                ));
    }

    private void notifyUsersByRole(
            Role role,
            String message,
            String type,
            Long referenceId,
            java.util.function.Predicate<NotificationPreference> isEnabled
    ) {
        List<User> users = userRepository.findByRole(role);
        for (User user : users) {
            NotificationPreference preferences = getOrCreatePreferences(user);
            if (isEnabled.test(preferences)) {
                saveNotification(user, message, type, referenceId);
            }
        }
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
