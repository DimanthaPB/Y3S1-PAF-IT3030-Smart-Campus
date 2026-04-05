package com.smartcampus.paf_project.repositories;

import com.smartcampus.paf_project.models.ERole;
import com.smartcampus.paf_project.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(ERole name);
}