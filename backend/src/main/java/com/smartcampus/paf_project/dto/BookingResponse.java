package com.smartcampus.paf_project.dto;

import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        String facilityName,
        Resource resource,
        String bookedBy,
        String userEmail,
        String userName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String purpose,
        Integer expectedAttendees,
        String approvalReason,
        String rejectionReason,
        String cancelReason,
        String cancelledBy,
        String cancelledByRole,
        LocalDateTime cancelledAt,
        BookingStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BookingResponse from(Booking booking, String userName, String cancelledByDisplayName) {
        return new BookingResponse(
                booking.getId(),
                booking.getFacilityName(),
                booking.getResource(),
                booking.getBookedBy(),
                booking.getBookedBy(),
                userName,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getApprovalReason(),
                booking.getRejectionReason(),
                booking.getCancelReason(),
                cancelledByDisplayName,
                booking.getCancelledByRole(),
                booking.getCancelledAt(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
