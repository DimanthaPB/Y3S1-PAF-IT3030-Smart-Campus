package com.smartcampus.paf_project.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientEmail; // කාටද මේක යන්නේ (User email)
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private boolean isRead = false; // කියවලාද නැද්ද කියලා බලන්න
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification(String recipientEmail, String title, String message) {
        this.recipientEmail = recipientEmail;
        this.title = title;
        this.message = message;
    }
}