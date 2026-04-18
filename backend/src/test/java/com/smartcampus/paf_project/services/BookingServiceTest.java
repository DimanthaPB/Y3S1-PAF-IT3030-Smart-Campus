package com.smartcampus.paf_project.services;

import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.models.Role;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.BookingRepository;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking ownBooking;
    private Booking otherBooking;

    @BeforeEach
    void setUp() {
        ownBooking = new Booking();
        ownBooking.setId(1L);
        ownBooking.setBookedBy("student1@example.com");
        ownBooking.setFacilityName("Lab A");
        ownBooking.setBookingDate(LocalDate.of(2026, 4, 20));
        ownBooking.setStatus(BookingStatus.PENDING);

        otherBooking = new Booking();
        otherBooking.setId(2L);
        otherBooking.setBookedBy("student2@example.com");
        otherBooking.setFacilityName("Hall B");
        otherBooking.setBookingDate(LocalDate.of(2026, 4, 21));
        otherBooking.setStatus(BookingStatus.APPROVED);
    }

    @Test
    void nonAdminOnlySeesOwnBookings() {
        when(bookingRepository.findAll()).thenReturn(List.of(ownBooking, otherBooking));

        List<Booking> result = bookingService.getFilteredBookings(
                null,
                null,
                null,
                null,
                false,
                "student1@example.com"
        );

        assertEquals(1, result.size());
        assertEquals("student1@example.com", result.getFirst().getBookedBy());
    }

    @Test
    void adminCanSeeAllBookingsAndFilterByEmail() {
        when(bookingRepository.findAll()).thenReturn(List.of(ownBooking, otherBooking));

        List<Booking> result = bookingService.getFilteredBookings(
                null,
                "student2@example.com",
                null,
                null,
                true,
                "admin@example.com"
        );

        assertEquals(1, result.size());
        assertEquals("student2@example.com", result.getFirst().getBookedBy());
    }

    @Test
    void nonAdminCannotApproveBookings() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> bookingService.approveBooking(1L, false, "student1@example.com")
        );

        assertEquals(403, ex.getStatusCode().value());
        verify(bookingRepository, never()).findById(any());
    }

    @Test
    void adminCanApprovePendingBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(ownBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.approveBooking(1L, true, "admin@example.com");

        assertEquals(BookingStatus.APPROVED, result.getStatus());
        verify(bookingRepository).save(ownBooking);
    }

    @Test
    void nonOwnerCannotAccessAnotherUsersBooking() {
        when(bookingRepository.findById(2L)).thenReturn(Optional.of(otherBooking));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> bookingService.getBookingById(2L, false, "student1@example.com")
        );

        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void bookingResponseIncludesUserNameWhenAvailable() {
        when(userRepository.findByEmail("student1@example.com")).thenReturn(Optional.of(
                User.builder()
                        .email("student1@example.com")
                        .name("Student One")
                        .role(Role.USER)
                        .build()
        ));

        var response = bookingService.toResponse(ownBooking);

        assertEquals("student1@example.com", response.userEmail());
        assertEquals("Student One", response.userName());
    }

    @Test
    void createBookingRejectsOverlappingBookingForSameResourceAndDate() {
        Resource resource = new Resource();
        resource.setId(10L);
        resource.setName("Projector Kit");
        resource.setStatus(Resource.ResourceStatus.ACTIVE);
        resource.setAvailableFromDate(LocalDate.of(2026, 4, 1));
        resource.setAvailableToDate(LocalDate.of(2026, 4, 30));
        resource.setAvailabilityStart(LocalTime.of(8, 0));
        resource.setAvailabilityEnd(LocalTime.of(18, 0));

        Booking request = new Booking();
        request.setResource(resource);
        request.setBookingDate(LocalDate.of(2026, 4, 20));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setExpectedAttendees(5);
        request.setPurpose("Lecture support");

        Booking existing = new Booking();
        existing.setStatus(BookingStatus.APPROVED);
        existing.setStartTime(LocalTime.of(10, 30));
        existing.setEndTime(LocalTime.of(11, 30));

        when(resourceRepository.findById(10L)).thenReturn(Optional.of(resource));
        when(bookingRepository.findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                resource,
                request.getBookingDate(),
                request.getEndTime(),
                request.getStartTime()
        )).thenReturn(List.of(existing));

        var ex = assertThrows(
                com.smartcampus.paf_project.exceptions.BookingConflictException.class,
                () -> bookingService.createBooking(request, "student1@example.com")
        );

        assertEquals("This resource is already booked for the selected time.", ex.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingRequiresPurpose() {
        Booking request = new Booking();
        request.setBookingDate(LocalDate.of(2026, 4, 20));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setExpectedAttendees(5);
        request.setPurpose("   ");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> bookingService.createBooking(request, "student1@example.com")
        );

        assertEquals(400, ex.getStatusCode().value());
        assertEquals("Purpose is required.", ex.getReason());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingRejectsPendingOverlapForSameResourceAndDate() {
        Resource resource = new Resource();
        resource.setId(10L);
        resource.setName("Projector Kit");
        resource.setStatus(Resource.ResourceStatus.ACTIVE);
        resource.setAvailableFromDate(LocalDate.of(2026, 4, 1));
        resource.setAvailableToDate(LocalDate.of(2026, 4, 30));
        resource.setAvailabilityStart(LocalTime.of(8, 0));
        resource.setAvailabilityEnd(LocalTime.of(18, 0));

        Booking request = new Booking();
        request.setResource(resource);
        request.setBookingDate(LocalDate.of(2026, 4, 20));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setExpectedAttendees(5);
        request.setPurpose("Seminar");

        Booking existing = new Booking();
        existing.setStatus(BookingStatus.PENDING);
        existing.setStartTime(LocalTime.of(10, 15));
        existing.setEndTime(LocalTime.of(11, 15));

        when(resourceRepository.findById(10L)).thenReturn(Optional.of(resource));
        when(bookingRepository.findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                resource,
                request.getBookingDate(),
                request.getEndTime(),
                request.getStartTime()
        )).thenReturn(List.of(existing));

        var ex = assertThrows(
                com.smartcampus.paf_project.exceptions.BookingConflictException.class,
                () -> bookingService.createBooking(request, "student1@example.com")
        );

        assertEquals("This resource is already booked for the selected time.", ex.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void adminCanRejectPendingBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(ownBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.rejectBooking(1L, "Schedule conflict", true, "admin@example.com");

        assertEquals(BookingStatus.REJECTED, result.getStatus());
        assertEquals("Schedule conflict", result.getRejectionReason());
    }

    @Test
    void rejectBookingRequiresReason() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(ownBooking));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> bookingService.rejectBooking(1L, "   ", true, "admin@example.com")
        );

        assertEquals(400, ex.getStatusCode().value());
        assertEquals("Rejection reason is required.", ex.getReason());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void ownerCanCancelApprovedBooking() {
        ownBooking.setStatus(BookingStatus.APPROVED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(ownBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.cancelBooking(1L, "No longer needed", false, "student1@example.com");

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        assertEquals("No longer needed", result.getCancelReason());
    }

    @Test
    void cancelBookingRequiresReason() {
        ownBooking.setStatus(BookingStatus.APPROVED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(ownBooking));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> bookingService.cancelBooking(1L, "  ", false, "student1@example.com")
        );

        assertEquals(400, ex.getStatusCode().value());
        assertEquals("Cancellation reason is required.", ex.getReason());
        verify(bookingRepository, never()).save(any());
    }
}
