package com.smartcampus.paf_project.repositories;

import com.smartcampus.paf_project.models.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(Resource.ResourceType type);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByStatus(Resource.ResourceStatus status);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}