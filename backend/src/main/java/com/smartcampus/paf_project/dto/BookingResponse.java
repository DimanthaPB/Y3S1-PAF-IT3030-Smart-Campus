package com.smartcampus.paf_project.dto;

import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;

import java.time.LocalDate;
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
        String rejectionReason,
        String cancelReason,
        BookingStatus status
) {
    public static BookingResponse from(Booking booking, String userName) {
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
                booking.getRejectionReason(),
                booking.getCancelReason(),
                booking.getStatus()
        );
    }
}
