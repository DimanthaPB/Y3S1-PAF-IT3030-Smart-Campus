package com.smartcampus.paf_project.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {

    public enum ResourceType {
        LECTURE_HALL,
        LAB,
        MEETING_ROOM,
        EQUIPMENT
    }

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE,
        INACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Resource type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Min(value = 0, message = "Capacity cannot be less than 0")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @NotNull(message = "Available from date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate availableFromDate;

    @NotNull(message = "Available to date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate availableToDate;

    @NotNull(message = "Availability start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availabilityStart;

    @NotNull(message = "Availability end time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime availabilityEnd;

    @NotNull(message = "Resource status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(length = 1000)
    private String description;

    public Resource() {
    }

    public Resource(Long id, String name, ResourceType type, Integer capacity, String location,
                    LocalDate availableFromDate, LocalDate availableToDate,
                    LocalTime availabilityStart, LocalTime availabilityEnd,
                    ResourceStatus status, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availableFromDate = availableFromDate;
        this.availableToDate = availableToDate;
        this.availabilityStart = availabilityStart;
        this.availabilityEnd = availabilityEnd;
        this.status = status;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getAvailableFromDate() {
        return availableFromDate;
    }

    public void setAvailableFromDate(LocalDate availableFromDate) {
        this.availableFromDate = availableFromDate;
    }

    public LocalDate getAvailableToDate() {
        return availableToDate;
    }

    public void setAvailableToDate(LocalDate availableToDate) {
        this.availableToDate = availableToDate;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @AssertTrue(message = "Capacity must be greater than 0 for lecture halls, labs, and meeting rooms")
    @Transient
    @JsonIgnore
    public boolean isCapacityValidForType() {
        if (type == null) {
            return true;
        }

        if (type == ResourceType.EQUIPMENT) {
            return capacity == null || capacity >= 0;
        }

        return capacity != null && capacity > 0;
    }

    @AssertTrue(message = "Available from date must be on or before available to date")
    @Transient
    @JsonIgnore
    public boolean isAvailabilityDateRangeValid() {
        return availableFromDate == null || availableToDate == null || !availableFromDate.isAfter(availableToDate);
    }

    @AssertTrue(message = "Available from date cannot be in the past")
    @Transient
    @JsonIgnore
    public boolean isAvailableFromDateNotInPast() {
        return availableFromDate == null || !availableFromDate.isBefore(LocalDate.now());
    }

    @AssertTrue(message = "Available to date cannot be in the past")
    @Transient
    @JsonIgnore
    public boolean isAvailableToDateNotInPast() {
        return availableToDate == null || !availableToDate.isBefore(LocalDate.now());
    }

    @AssertTrue(message = "Availability start time must be earlier than availability end time")
    @Transient
    @JsonIgnore
    public boolean isAvailabilityWindowValid() {
        return availabilityStart == null || availabilityEnd == null || availabilityStart.isBefore(availabilityEnd);
    }
}
