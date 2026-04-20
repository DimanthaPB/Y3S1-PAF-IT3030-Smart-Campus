package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import com.smartcampus.paf_project.service.NotificationEventService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceRepository resourceRepository;
    private final NotificationEventService notificationEventService;

    public ResourceController(ResourceRepository resourceRepository, NotificationEventService notificationEventService) {
        this.resourceRepository = resourceRepository;
        this.notificationEventService = notificationEventService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(Authentication authentication) {
        return ResponseEntity.ok(getAccessibleResources(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id, Authentication authentication) {
        Optional<Resource> resource = resourceRepository.findById(id);
        return resource
                .filter(foundResource -> isAdmin(authentication) || foundResource.getStatus() == Resource.ResourceStatus.ACTIVE)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(
        Authentication authentication,
        @RequestParam(required = false) Resource.ResourceType type,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Resource.ResourceStatus status,
        @RequestParam(required = false) Integer capacity,
        @RequestParam(required = false) LocalDate availableFromDate,
        @RequestParam(required = false) LocalDate availableToDate,
        @RequestParam(required = false) LocalTime availabilityStart,
        @RequestParam(required = false) LocalTime availabilityEnd) {

        List<Resource> resources = getAccessibleResources(authentication);

        if (type != null) {
        resources = resources.stream()
                .filter(resource -> resource.getType() == type)
                .toList();
        }

        if (location != null && !location.isBlank()) {
        resources = resources.stream()
                .filter(resource -> resource.getLocation() != null &&
                        resource.getLocation().toLowerCase().contains(location.toLowerCase()))
                .toList();
        }

        if (status != null) {
        resources = resources.stream()
                .filter(resource -> resource.getStatus() == status)
                .toList();
        }

        if (capacity != null) {
        resources = resources.stream()
                .filter(resource -> resource.getCapacity() != null &&
                        resource.getCapacity() >= capacity)
                .toList();
        }

        if (availableFromDate != null) {
        resources = resources.stream()
                .filter(resource -> resource.getAvailableToDate() != null &&
                        !resource.getAvailableToDate().isBefore(availableFromDate))
                .toList();
        }

        if (availableToDate != null) {
        resources = resources.stream()
                .filter(resource -> resource.getAvailableFromDate() != null &&
                        !resource.getAvailableFromDate().isAfter(availableToDate))
                .toList();
        }

        if (availabilityStart != null) {
        resources = resources.stream()
                .filter(resource -> resource.getAvailabilityStart() != null &&
                        !resource.getAvailabilityStart().isAfter(availabilityStart))
                .toList();
        }

        if (availabilityEnd != null) {
        resources = resources.stream()
                .filter(resource -> resource.getAvailabilityEnd() != null &&
                        !resource.getAvailabilityEnd().isBefore(availabilityEnd))
                .toList();
        }

        return ResponseEntity.ok(resources);
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(
            @Valid @RequestBody Resource resource,
            Authentication authentication
    ) {
        requireAdmin(authentication);
        Resource savedResource = resourceRepository.save(resource);
        notificationEventService.notifyUsersAboutSystemEvent(
                buildResourceCreatedMessage(savedResource),
                savedResource.getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody Resource updatedResource,
            Authentication authentication
    ) {
        requireAdmin(authentication);
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setName(updatedResource.getName());
                    resource.setType(updatedResource.getType());
                    resource.setCapacity(updatedResource.getCapacity());
                    resource.setLocation(updatedResource.getLocation());
                    resource.setAvailableFromDate(updatedResource.getAvailableFromDate());
                    resource.setAvailableToDate(updatedResource.getAvailableToDate());
                    resource.setAvailabilityStart(updatedResource.getAvailabilityStart());
                    resource.setAvailabilityEnd(updatedResource.getAvailabilityEnd());
                    resource.setStatus(updatedResource.getStatus());
                    resource.setDescription(updatedResource.getDescription());

                    Resource saved = resourceRepository.save(resource);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id, Authentication authentication) {
        requireAdmin(authentication);
        if (!resourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private void requireAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private List<Resource> getAccessibleResources(Authentication authentication) {
        if (isAdmin(authentication)) {
            return resourceRepository.findAll();
        }

        return resourceRepository.findByStatus(Resource.ResourceStatus.ACTIVE);
    }

    private String buildResourceCreatedMessage(Resource resource) {
        String resourceName = resource.getName() == null || resource.getName().isBlank()
                ? "A new resource"
                : resource.getName();
        return resourceName + " is now available for users.";
    }
}
