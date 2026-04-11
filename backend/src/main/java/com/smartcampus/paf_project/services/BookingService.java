package com.smartcampus.paf_project.services;

import com.smartcampus.paf_project.exceptions.BookingConflictException;
import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {

        List<Booking> conflictingBookings =
                bookingRepository.findByFacilityNameAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        booking.getFacilityName(),
                        booking.getBookingDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );

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
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long id, String rejectionReason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id, String cancelReason) {
        Booking booking = getBookingById(id);
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