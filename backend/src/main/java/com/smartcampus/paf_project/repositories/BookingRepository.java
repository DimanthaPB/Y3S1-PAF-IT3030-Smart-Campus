package com.smartcampus.paf_project.repositories;

import com.smartcampus.paf_project.models.Booking;
import com.smartcampus.paf_project.models.BookingStatus;
import com.smartcampus.paf_project.models.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByFacilityNameAndBookingDate(
            String facilityName,
            LocalDate bookingDate
    );

    List<Booking> findByFacilityNameAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
            String facilityName,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime
    );

    List<Booking> findByResourceAndBookingDate(
            Resource resource,
            LocalDate bookingDate
    );

    List<Booking> findByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Resource resource,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime
    );

    List<Booking> findByBookedByIgnoreCase(String bookedBy);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByFacilityNameIgnoreCase(String facilityName);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByStatusAndBookedByIgnoreCase(BookingStatus status, String bookedBy);

    List<Booking> findByStatusAndFacilityNameIgnoreCase(BookingStatus status, String facilityName);

    List<Booking> findByStatusAndBookingDate(BookingStatus status, LocalDate bookingDate);
}