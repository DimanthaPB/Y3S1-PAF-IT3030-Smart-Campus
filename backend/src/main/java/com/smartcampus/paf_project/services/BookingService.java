package com.smartcampus.paf_project.services;

import com.smartcampus.paf_project.dto.BookingResponse;
import com.smartcampus.paf_project.exceptions.BookingConflictException;
import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.repositories.BookingRepository;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.smartcampus.paf_project.service.NotificationEventService notificationEventService;

    public Booking createBooking(Booking booking, String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to create a booking.");
        }

        validateBookingInput(booking);

        List<Booking> conflictingBookings;

        if (booking.getResource() != null && booking.getResource().getId() != null) {
            Resource resource = resourceRepository.findById(booking.getResource().getId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            validateBookingAgainstResource(booking, resource);
            booking.setResource(resource);

            if (booking.getFacilityName() == null || booking.getFacilityName().isBlank()) {
                booking.setFacilityName(resource.getName());
            }

            conflictingBookings = bookingRepository.findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                    resource,
                    booking.getBookingDate(),
                    booking.getEndTime(),
                    booking.getStartTime()
            );
        } else {
            conflictingBookings = bookingRepository.findByFacilityNameAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
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
            throw new BookingConflictException(buildConflictMessage(conflictingBookings));
        }

        booking.setBookedBy(currentUserEmail);
        booking.setStatus(BookingStatus.PENDING);
        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(LocalDateTime.now());
        }
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        notifyAdminsAboutBookingIfAvailable(
                "New booking request submitted for " + resolveBookingDisplayName(savedBooking)
                        + " by " + savedBooking.getBookedBy() + ".",
                savedBooking.getId()
        );
        return savedBooking;
    }

    public Booking updateBooking(Long id, Booking updatedBooking, boolean isAdmin, String currentUserEmail) {
        Booking existingBooking = getBookingById(id, isAdmin, currentUserEmail);

        if (existingBooking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be edited."
            );
        }

        validateBookingInput(updatedBooking);

        Resource resource = resolveBookingResource(updatedBooking);
        validateBookingAgainstResource(updatedBooking, resource);
        ensureNoConflicts(updatedBooking, resource, existingBooking.getId());

        existingBooking.setResource(resource);
        existingBooking.setFacilityName(resource.getName());
        existingBooking.setBookingDate(updatedBooking.getBookingDate());
        existingBooking.setStartTime(updatedBooking.getStartTime());
        existingBooking.setEndTime(updatedBooking.getEndTime());
        existingBooking.setPurpose(updatedBooking.getPurpose().trim());
        existingBooking.setExpectedAttendees(updatedBooking.getExpectedAttendees());
        existingBooking.setApprovalReason(null);
        existingBooking.setRejectionReason(null);
        existingBooking.setCancelReason(null);
        existingBooking.setCancelledBy(null);
        existingBooking.setCancelledByRole(null);
        existingBooking.setCancelledAt(null);
        existingBooking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(existingBooking);
    }

    public void deleteBooking(Long id, boolean isAdmin, String currentUserEmail) {
        Booking booking = getBookingById(id, isAdmin, currentUserEmail);

        if (!isAdmin && booking.getStatus() == BookingStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approved bookings must be cancelled before they can be deleted."
            );
        }

        bookingRepository.delete(booking);
    }

    public List<Booking> getFilteredBookings(
            String status,
            String bookedBy,
            String facilityName,
            LocalDate bookingDate,
            boolean isAdmin,
            String currentUserEmail
    ) {
        List<Booking> bookings = bookingRepository.findAll();

        if (!isAdmin) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getBookedBy() != null && booking.getBookedBy().equalsIgnoreCase(currentUserEmail))
                    .toList();
        }

        if (status != null && !status.isBlank()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookings = bookings.stream()
                    .filter(booking -> booking.getStatus() == bookingStatus)
                    .toList();
        }

        if (isAdmin && bookedBy != null && !bookedBy.isBlank()) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getBookedBy() != null && booking.getBookedBy().equalsIgnoreCase(bookedBy))
                    .toList();
        }

        if (facilityName != null && !facilityName.isBlank()) {
            bookings = bookings.stream()
                    .filter(booking -> {
                        String resolvedFacilityName = booking.getFacilityName();
                        if ((resolvedFacilityName == null || resolvedFacilityName.isBlank()) && booking.getResource() != null) {
                            resolvedFacilityName = booking.getResource().getName();
                        }

                        return resolvedFacilityName != null &&
                                resolvedFacilityName.toLowerCase().contains(facilityName.toLowerCase());
                    })
                    .toList();
        }

        if (bookingDate != null) {
            bookings = bookings.stream()
                    .filter(booking -> bookingDate.equals(booking.getBookingDate()))
                    .toList();
        }

        return bookings;
    }

    public Booking getBookingById(Long id, boolean isAdmin, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ensureBookingAccess(booking, isAdmin, currentUserEmail);
        return booking;
    }

    public List<Booking> getBookingsByFacilityAndDate(String facilityName, LocalDate bookingDate) {
        return bookingRepository.findByFacilityNameAndBookingDate(facilityName, bookingDate);
    }

    public Booking approveBooking(Long id, String approvalReason, boolean isAdmin, String currentUserEmail) {
        ensureAdminAccess(isAdmin);
        Booking booking = getBookingById(id, isAdmin, currentUserEmail);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved.");
        }

        if (approvalReason == null || approvalReason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approval reason is required.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovalReason(approvalReason.trim());
        booking.setRejectionReason(null);
        booking.setCancelReason(null);
        booking.setCancelledBy(null);
        booking.setCancelledByRole(null);
        booking.setCancelledAt(null);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);
        notifyBookingEventIfAvailable(
                savedBooking.getBookedBy(),
                "Your booking for " + resolveBookingDisplayName(savedBooking) + " was approved.",
                savedBooking.getId()
        );
        return savedBooking;
    }

    public Booking rejectBooking(Long id, String rejectionReason, boolean isAdmin, String currentUserEmail) {
        ensureAdminAccess(isAdmin);
        Booking booking = getBookingById(id, isAdmin, currentUserEmail);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected.");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovalReason(null);
        booking.setRejectionReason(rejectionReason.trim());
        booking.setCancelReason(null);
        booking.setCancelledBy(null);
        booking.setCancelledByRole(null);
        booking.setCancelledAt(null);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);
        notifyBookingEventIfAvailable(
                savedBooking.getBookedBy(),
                "Your booking for " + resolveBookingDisplayName(savedBooking) + " was rejected.",
                savedBooking.getId()
        );
        return savedBooking;
    }

    public Booking cancelBooking(Long id, String cancelReason, boolean isAdmin, String currentUserEmail) {
        Booking booking = getBookingById(id, isAdmin, currentUserEmail);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be cancelled.");
        }

        if (cancelReason == null || cancelReason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancellation reason is required.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(cancelReason.trim());
        booking.setCancelledBy(resolveCancelledByDisplayName(currentUserEmail, isAdmin));
        booking.setCancelledByRole(isAdmin ? "ADMIN" : "USER");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);
        notifyBookingEventIfAvailable(
                savedBooking.getBookedBy(),
                "Your booking for " + resolveBookingDisplayName(savedBooking) + " was cancelled.",
                savedBooking.getId()
        );
        return savedBooking;
    }

    public List<Booking> getBookingsByUser(String bookedBy, boolean isAdmin, String currentUserEmail) {
        if (!isAdmin && !currentUserEmail.equalsIgnoreCase(bookedBy)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own bookings.");
        }

        return bookingRepository.findAll()
                .stream()
                .filter(booking -> booking.getBookedBy() != null && booking.getBookedBy().equalsIgnoreCase(bookedBy))
                .toList();
    }

    public List<Booking> getConflictBookings(Long resourceId, LocalDate bookingDate) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            return List.of();
        }

        return bookingRepository.findByResourceAndBookingDate(resource, bookingDate)
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED)
                .toList();
    }

    private void validateBookingAgainstResource(Booking booking, Resource resource) {
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
    }

    private void validateBookingInput(Booking booking) {
        if (booking.getBookingDate() == null || booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date, start time, and end time are required.");
        }

        if (booking.getPurpose() == null || booking.getPurpose().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purpose is required.");
        }

        if (booking.getExpectedAttendees() == null || booking.getExpectedAttendees() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees must be greater than 0.");
        }

        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be later than start time.");
        }

        if (booking.getResource() == null || booking.getResource().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid resource is required.");
        }
    }

    private Resource resolveBookingResource(Booking booking) {
        return resourceRepository.findById(booking.getResource().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    private void ensureNoConflicts(Booking booking, Resource resource, Long bookingIdToIgnore) {
        List<Booking> conflictingBookings = bookingRepository
                .findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                        resource,
                        booking.getBookingDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );

        boolean hasConflict = conflictingBookings.stream().anyMatch(existingBooking ->
                !existingBooking.getId().equals(bookingIdToIgnore) &&
                        (existingBooking.getStatus() == BookingStatus.PENDING ||
                                existingBooking.getStatus() == BookingStatus.APPROVED)
        );

        if (hasConflict) {
            List<Booking> activeConflicts = conflictingBookings.stream()
                    .filter(existingBooking ->
                            !existingBooking.getId().equals(bookingIdToIgnore) &&
                                    (existingBooking.getStatus() == BookingStatus.PENDING ||
                                            existingBooking.getStatus() == BookingStatus.APPROVED)
                    )
                    .toList();
            throw new BookingConflictException(buildConflictMessage(activeConflicts));
        }
    }

    private String buildConflictMessage(List<Booking> conflictingBookings) {
        List<Booking> activeConflicts = conflictingBookings.stream()
                .filter(existingBooking ->
                        existingBooking.getStatus() == BookingStatus.PENDING ||
                                existingBooking.getStatus() == BookingStatus.APPROVED
                )
                .toList();

        if (activeConflicts.isEmpty()) {
            return "This resource is already booked for the selected time.";
        }

        String conflictSummary = activeConflicts.stream()
                .map(existingBooking -> String.format(
                        "%s booking from %s to %s",
                        existingBooking.getStatus(),
                        existingBooking.getStartTime(),
                        existingBooking.getEndTime()
                ))
                .distinct()
                .collect(java.util.stream.Collectors.joining("; "));

        return "This resource is already booked for the selected time. Conflicts with " + conflictSummary + ".";
    }

    private void ensureAdminAccess(boolean isAdmin) {
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required for this action.");
        }
    }

    private void ensureBookingAccess(Booking booking, boolean isAdmin, String currentUserEmail) {
        if (!isAdmin && (booking.getBookedBy() == null || !booking.getBookedBy().equalsIgnoreCase(currentUserEmail))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own bookings.");
        }
    }

    public BookingResponse toResponse(Booking booking) {
        String userName = null;
        String cancelledByDisplayName = booking.getCancelledBy();

        if (booking.getBookedBy() != null && !booking.getBookedBy().isBlank()) {
            userName = userRepository.findByEmail(booking.getBookedBy())
                    .map(user -> user.getName())
                    .orElse(null);
        }

        if (booking.getCancelledBy() != null && !booking.getCancelledBy().isBlank()) {
            cancelledByDisplayName = sanitizeCancelledByDisplayName(
                    booking.getCancelledBy(),
                    booking.getCancelledByRole()
            );
        }

        return BookingResponse.from(booking, userName, cancelledByDisplayName);
    }

    public List<BookingResponse> toResponses(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toResponse)
                .toList();
    }

    private String resolveBookingDisplayName(Booking booking) {
        if (booking.getFacilityName() != null && !booking.getFacilityName().isBlank()) {
            return booking.getFacilityName();
        }
        if (booking.getResource() != null && booking.getResource().getName() != null) {
            return booking.getResource().getName();
        }
        return "your selected resource";
    }

    private void notifyBookingEventIfAvailable(String recipientEmail, String message, Long bookingId) {
        if (notificationEventService == null) {
            return;
        }

        notificationEventService.notifyBookingEvent(recipientEmail, message, bookingId);
    }

    private void notifyAdminsAboutBookingIfAvailable(String message, Long bookingId) {
        if (notificationEventService == null) {
            return;
        }

        notificationEventService.notifyAdminsAboutBooking(message, bookingId);
    }

    private String resolveCancelledByDisplayName(String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return "Admin";
        }

        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            return "User";
        }

        return userRepository.findByEmail(currentUserEmail)
                .map(user -> {
                    String name = user.getName();
                    return (name == null || name.isBlank()) ? "User" : name.trim();
                })
                .orElse("User");
    }

    private String sanitizeCancelledByDisplayName(String cancelledBy, String cancelledByRole) {
        if (cancelledBy == null || cancelledBy.isBlank()) {
            return "ADMIN".equalsIgnoreCase(cancelledByRole) ? "Admin" : "User";
        }

        if ("ADMIN".equalsIgnoreCase(cancelledByRole)) {
            return "Admin";
        }

        if (!cancelledBy.contains("@")) {
            return cancelledBy;
        }

        return userRepository.findByEmail(cancelledBy)
                .map(user -> {
                    String name = user.getName();
                    return (name == null || name.isBlank()) ? "User" : name.trim();
                })
                .orElse("User");
    }
}
