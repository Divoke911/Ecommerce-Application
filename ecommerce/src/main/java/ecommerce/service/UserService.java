package ecommerce.service;

import ecommerce.dto.response.UserResponse;
import ecommerce.entity.User;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.exception.UnauthorizedException;
import ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getMyProfile() {
        return toResponse(getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(String name, String phone) {
        User user = getCurrentUser();
        if (name != null && !name.isBlank())   user.setName(name);
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        UserResponse response = toResponse(userRepository.save(user));
        log.info("Profile updated: userId={}", user.getId());
        return response;
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed: userId={}", user.getId());
    }

    @Transactional
    public void deactivateAccount() {
        User user = getCurrentUser();
        user.setIsActive(false);
        userRepository.save(user);
        log.info("Account deactivated: userId={}", user.getId());
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isEmailVerified(user.getIsEmailVerified())
                .roles(user.getRoles().stream()
                        .map(r -> r.getId().getRole())
                        .collect(Collectors.toSet()))
                .build();
    }
}