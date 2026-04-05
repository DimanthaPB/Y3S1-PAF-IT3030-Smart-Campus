package com.smartcampus.paf_project.security;

import com.smartcampus.paf_project.models.ERole;
import com.smartcampus.paf_project.models.Role;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.RoleRepository;
import com.smartcampus.paf_project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws ServletException, IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (!userRepository.existsByEmail(email)) {
            User newUser = new User(name, email, ""); 

            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_USER))); 
            roles.add(userRole);

            newUser.setRoles(roles);
            userRepository.save(newUser);
        }

        this.setAlwaysUseDefaultTargetUrl(true);
        this.setDefaultTargetUrl("/api/auth/success");
        super.onAuthenticationSuccess(request, response, authentication);
    }
}