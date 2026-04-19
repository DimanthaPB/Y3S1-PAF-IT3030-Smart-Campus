package com.smartcampus.paf_project.controllers;

import com.smartcampus.paf_project.models.Resource;
import com.smartcampus.paf_project.repositories.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceController resourceController;

    @Test
    void regularUsersOnlyReceiveActiveResources() {
        Resource active = new Resource();
        active.setId(1L);
        active.setName("Active Lab");
        active.setStatus(Resource.ResourceStatus.ACTIVE);

        when(resourceRepository.findByStatus(Resource.ResourceStatus.ACTIVE)).thenReturn(List.of(active));

        ResponseEntity<List<Resource>> response = resourceController.getAllResources(
                new UsernamePasswordAuthenticationToken(
                        "user@example.com",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(Resource.ResourceStatus.ACTIVE, response.getBody().getFirst().getStatus());
        verify(resourceRepository).findByStatus(Resource.ResourceStatus.ACTIVE);
    }

    @Test
    void adminsReceiveAllResources() {
        Resource active = new Resource();
        active.setId(1L);
        active.setStatus(Resource.ResourceStatus.ACTIVE);

        Resource inactive = new Resource();
        inactive.setId(2L);
        inactive.setStatus(Resource.ResourceStatus.INACTIVE);

        when(resourceRepository.findAll()).thenReturn(List.of(active, inactive));

        ResponseEntity<List<Resource>> response = resourceController.getAllResources(
                new UsernamePasswordAuthenticationToken(
                        "admin@example.com",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                )
        );

        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(resourceRepository).findAll();
    }

    @Test
    void regularUsersCannotFetchInactiveResourceById() {
        Resource inactive = new Resource();
        inactive.setId(2L);
        inactive.setStatus(Resource.ResourceStatus.INACTIVE);

        when(resourceRepository.findById(2L)).thenReturn(Optional.of(inactive));

        ResponseEntity<Resource> response = resourceController.getResourceById(
                2L,
                new UsernamePasswordAuthenticationToken(
                        "user@example.com",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void regularUsersCannotCreateResources() {
        Resource resource = new Resource();
        resource.setName("New Lab");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                resourceController.createResource(
                        resource,
                        new UsernamePasswordAuthenticationToken(
                                "user@example.com",
                                "token",
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        )
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Admin access"));
        verify(resourceRepository, never()).save(resource);
    }

    @Test
    void regularUsersCannotUpdateResources() {
        Resource updatedResource = new Resource();
        updatedResource.setName("Updated Lab");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                resourceController.updateResource(
                        1L,
                        updatedResource,
                        new UsernamePasswordAuthenticationToken(
                                "user@example.com",
                                "token",
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        )
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        verify(resourceRepository, never()).findById(1L);
    }

    @Test
    void regularUsersCannotDeleteResources() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                resourceController.deleteResource(
                        1L,
                        new UsernamePasswordAuthenticationToken(
                                "user@example.com",
                                "token",
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        )
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        verify(resourceRepository, never()).existsById(1L);
    }
}
