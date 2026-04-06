package com.smartcampus.paf_project.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private boolean receiveBookingAlerts = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean receiveTicketAlerts = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean receiveSystemAlerts = true;
}
