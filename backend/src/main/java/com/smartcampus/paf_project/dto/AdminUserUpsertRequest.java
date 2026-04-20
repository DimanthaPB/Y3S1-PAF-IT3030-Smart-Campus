package com.smartcampus.paf_project.dto;

public record AdminUserUpsertRequest(
        String email,
        String name,
        String password,
        String role
) {
}
