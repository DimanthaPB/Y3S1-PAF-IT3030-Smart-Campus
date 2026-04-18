package com.smartcampus.paf_project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 5000, message = "Resolution notes must be at most 5000 characters")
    private String resolutionNotes;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
