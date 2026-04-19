package com.smartcampus.paf_project.dto;

public record UserProfileResponse(
        Long id,
        String email,
        String name,
        String avatarUrl,
        String role,
        String authProvider
) {
}
