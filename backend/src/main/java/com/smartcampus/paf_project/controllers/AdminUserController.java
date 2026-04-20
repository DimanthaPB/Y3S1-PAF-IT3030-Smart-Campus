package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.dto.AdminUserResponse;
import com.smartcampus.paf_project.dto.AdminUserUpsertRequest;
import com.smartcampus.paf_project.models.AuthProvider;
import com.smartcampus.paf_project.models.NotificationPreference;
import com.smartcampus.paf_project.models.Role;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.NotificationPreferenceRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(
            UserRepository userRepository,
            NotificationPreferenceRepository notificationPreferenceRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> createUser(@RequestBody AdminUserUpsertRequest request) {
        String normalizedEmail = normalizeRequired(request.email(), "Email is required").toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        Role nextRole = resolveSupportedRole(request.role());
        String password = normalizeRequired(request.password(), "Password is required");
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .name(normalizeOptional(request.name()))
                .password(passwordEncoder.encode(password))
                .authProvider(AuthProvider.LOCAL)
                .role(nextRole)
                .build();

        User savedUser = userRepository.save(user);
        notificationPreferenceRepository.save(NotificationPreference.builder()
                .user(savedUser)
                .receiveBookingAlerts(true)
                .receiveTicketAlerts(true)
                .receiveSystemAlerts(true)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserUpsertRequest request,
            Principal principal
    ) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalizedEmail = normalizeRequired(request.email(), "Email is required").toLowerCase();
        userRepository.findByEmail(normalizedEmail)
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
                });

        Role nextRole = resolveSupportedRole(request.role());
        ensureSafeSelfManagement(targetUser, nextRole, normalizedEmail, principal);

        targetUser.setEmail(normalizedEmail);
        targetUser.setName(normalizeOptional(request.name()));
        targetUser.setRole(nextRole);

        String nextPassword = normalizeOptional(request.password());
        if (targetUser.getAuthProvider() == AuthProvider.LOCAL && nextPassword != null) {
            if (nextPassword.length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
            }
            targetUser.setPassword(passwordEncoder.encode(nextPassword));
        }

        User savedUser = userRepository.save(targetUser);
        return ResponseEntity.ok(toResponse(savedUser));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload,
            Principal principal
    ) {
        String roleValue = payload.get("role");
        if (roleValue == null || roleValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        Role nextRole = resolveSupportedRole(roleValue);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ensureSafeSelfManagement(targetUser, nextRole, targetUser.getEmail(), principal);

        targetUser.setRole(nextRole);
        User savedUser = userRepository.save(targetUser);
        return ResponseEntity.ok(toResponse(savedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (principal != null
                && principal.getName() != null
                && principal.getName().equalsIgnoreCase(targetUser.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own current account");
        }

        userRepository.delete(targetUser);
        return ResponseEntity.noContent().build();
    }

    private Role resolveSupportedRole(String roleValue) {
        try {
            Role nextRole = Role.valueOf(normalizeRequired(roleValue, "Role is required").toUpperCase());
            if (nextRole != Role.USER && nextRole != Role.ADMIN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only USER and ADMIN roles are supported here");
            }
            return nextRole;
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
    }

    private void ensureSafeSelfManagement(User targetUser, Role nextRole, String nextEmail, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return;
        }

        if (principal.getName().equalsIgnoreCase(targetUser.getEmail())) {
            if (nextRole != Role.ADMIN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own admin access");
            }
            if (!principal.getName().equalsIgnoreCase(nextEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change your own login email from this page");
            }
        }
    }

    private String normalizeRequired(String value, String errorMessage) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getRole() == null ? null : user.getRole().name(),
                user.getAuthProvider() == null ? null : user.getAuthProvider().name()
        );
    }
}
