package com.smartcampus.paf_project.security;

import com.smartcampus.paf_project.models.AuthProvider;
import com.smartcampus.paf_project.models.NotificationPreference;
import com.smartcampus.paf_project.models.Role;
import com.smartcampus.paf_project.models.User;
import com.smartcampus.paf_project.repositories.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws ServletException, IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(avatar)
                    .authProvider(AuthProvider.GOOGLE)
                    .role(Role.USER) // Default role
                    .build();

            // Default preferences
            NotificationPreference prefs = NotificationPreference.builder()
                    .receiveBookingAlerts(true)
                    .receiveSystemAlerts(true)
                    .receiveTicketAlerts(true)
                    .user(user)
                    .build();
            user.setNotificationPreference(prefs);

            userRepository.save(user);
        } else {
            boolean changed = false;

            if (user.getAuthProvider() == null) {
                user.setAuthProvider(AuthProvider.GOOGLE);
                changed = true;
            }

            if (name != null && !name.isBlank() && !name.equals(user.getName())) {
                user.setName(name);
                changed = true;
            }

            if (avatar != null && !avatar.isBlank() && !avatar.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(avatar);
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Redirect to frontend with token as URL param
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth2/redirect?token=" + token);
    }
}
