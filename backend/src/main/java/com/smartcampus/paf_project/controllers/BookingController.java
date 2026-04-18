package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.dto.BookingResponse;
import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public BookingResponse createBooking(@RequestBody Booking booking, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.createBooking(booking, authentication.getName())
        );
    }

    @GetMapping
    public List<BookingResponse> getAllBookings(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bookedBy,
            @RequestParam(required = false) String facilityName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate
    ) {
        return bookingService.toResponses(
                bookingService.getFilteredBookings(
                        status,
                        bookedBy,
                        facilityName,
                        bookingDate,
                        isAdmin(authentication),
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}")
    public BookingResponse getBookingById(@PathVariable Long id, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.getBookingById(id, isAdmin(authentication), authentication.getName())
        );
    }

    @GetMapping("/user/{bookedBy}")
    public List<BookingResponse> getBookingsByUser(@PathVariable String bookedBy, Authentication authentication) {
        return bookingService.toResponses(
                bookingService.getBookingsByUser(bookedBy, isAdmin(authentication), authentication.getName())
        );
    }

    @GetMapping("/conflicts")
    public List<Map<String, Object>> getConflictBookings(
            @RequestParam Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate
    ) {
        return bookingService.getConflictBookings(resourceId, bookingDate)
                .stream()
                .map(booking -> Map.<String, Object>of(
                        "id", booking.getId(),
                        "status", booking.getStatus(),
                        "startTime", booking.getStartTime(),
                        "endTime", booking.getEndTime()
                ))
                .toList();
    }

    @PutMapping("/{id}/approve")
    public BookingResponse approveBooking(@PathVariable Long id, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.approveBooking(id, isAdmin(authentication), authentication.getName())
        );
    }

    @PutMapping("/{id}/reject")
    public BookingResponse rejectBooking(@PathVariable Long id, @RequestParam String reason, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.rejectBooking(id, reason, isAdmin(authentication), authentication.getName())
        );
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id, @RequestParam String reason, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.cancelBooking(id, reason, isAdmin(authentication), authentication.getName())
        );
    }

    @PutMapping("/{id}")
    public BookingResponse updateBooking(@PathVariable Long id, @RequestBody Booking booking, Authentication authentication) {
        return bookingService.toResponse(
                bookingService.updateBooking(id, booking, isAdmin(authentication), authentication.getName())
        );
    }

    @DeleteMapping("/{id}")
    public void deleteBooking(@PathVariable Long id, Authentication authentication) {
        bookingService.deleteBooking(id, isAdmin(authentication), authentication.getName());
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
