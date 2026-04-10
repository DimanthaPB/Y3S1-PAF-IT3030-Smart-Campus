package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        Optional<Resource> resource = resourceRepository.findById(id);
        return resource.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource savedResource = resourceRepository.save(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id,
                                                   @Valid @RequestBody Resource updatedResource) {
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setName(updatedResource.getName());
                    resource.setType(updatedResource.getType());
                    resource.setCapacity(updatedResource.getCapacity());
                    resource.setLocation(updatedResource.getLocation());
                    resource.setStatus(updatedResource.getStatus());
                    resource.setDescription(updatedResource.getDescription());

                    Resource saved = resourceRepository.save(resource);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}