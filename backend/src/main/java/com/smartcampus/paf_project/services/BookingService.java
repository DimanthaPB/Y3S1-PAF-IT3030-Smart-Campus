package com.smartcampus.paf_project.services;

import com.smartcampus.paf_project.exceptions.BookingConflictException;
import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.repositories.BookingRepository;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

public Booking createBooking(Booking booking) {

    List<Booking> conflictingBookings;

    if (booking.getResource() != null && booking.getResource().getId() != null) {
        Resource resource = resourceRepository.findById(booking.getResource().getId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new RuntimeException("Selected resource is not active.");
        }

        if (resource.getCapacity() != null
                && booking.getExpectedAttendees() != null
                && booking.getExpectedAttendees() > resource.getCapacity()) {
            throw new RuntimeException("Expected attendees exceed resource capacity.");
        }

        if (resource.getAvailableFromDate() != null && booking.getBookingDate().isBefore(resource.getAvailableFromDate())) {
            throw new RuntimeException("Booking date is before the resource available from date.");
        }

        if (resource.getAvailableToDate() != null && booking.getBookingDate().isAfter(resource.getAvailableToDate())) {
            throw new RuntimeException("Booking date is after the resource available to date.");
        }

        if (resource.getAvailabilityStart() != null && booking.getStartTime().isBefore(resource.getAvailabilityStart())) {
            throw new RuntimeException("Booking start time is before the resource availability start time.");
        }

        if (resource.getAvailabilityEnd() != null && booking.getEndTime().isAfter(resource.getAvailabilityEnd())) {
            throw new RuntimeException("Booking end time is after the resource availability end time.");
        }

        booking.setResource(resource);

        if (booking.getFacilityName() == null || booking.getFacilityName().isBlank()) {
            booking.setFacilityName(resource.getName());
        }

        conflictingBookings =
                bookingRepository.findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        resource,
                        booking.getBookingDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );
    } else {
        conflictingBookings =
                bookingRepository.findByFacilityNameAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        booking.getFacilityName(),
                        booking.getBookingDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );
    }

    boolean hasConflict = conflictingBookings.stream().anyMatch(existingBooking ->
            existingBooking.getStatus() == BookingStatus.PENDING ||
            existingBooking.getStatus() == BookingStatus.APPROVED
    );

    if (hasConflict) {
        throw new BookingConflictException("Booking conflict detected for this facility and time range.");
    }

    booking.setStatus(BookingStatus.PENDING);

    return bookingRepository.save(booking);
}
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByFacilityAndDate(String facilityName, LocalDate bookingDate) {
        return bookingRepository.findByFacilityNameAndBookingDate(facilityName, bookingDate);
    }

    public Booking approveBooking(Long id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long id, String rejectionReason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id, String cancelReason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(cancelReason);
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUser(String bookedBy) {
        return bookingRepository.findAll()
                .stream()
                .filter(booking -> booking.getBookedBy().equalsIgnoreCase(bookedBy))
                .toList();
    }
}