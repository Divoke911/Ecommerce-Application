package ecommerce.service;

import ecommerce.dto.request.*;
import ecommerce.dto.response.*;
import ecommerce.entity.*;
import ecommerce.enums.Role;
import ecommerce.exception.*;
import ecommerce.repository.UserRepository;
import ecommerce.repository.UserRoleRepository;
import ecommerce.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository     userRepository;
    private final UserRoleRepository userRoleRepository;
    private final OtpService         otpService;
    private final EmailService       emailService;
    private final JwtService         jwtService;
    private final PasswordEncoder    passwordEncoder;

    // ── Step 1: Register ──────────────────────────────────
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered.");
        }

        // Generate and store OTP in Redis FIRST
        // If Redis fails — exception thrown, user NOT saved
        String otp = otpService.generateEmailVerificationOtp(
                request.getEmail());

        // Save user to get generated ID
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .isEmailVerified(false)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        // Assign CUSTOMER role with correct user ID
        UserRole userRole = new UserRole();
        userRole.setId(new UserRole.UserRoleId(
                savedUser.getId(), Role.CUSTOMER));
        userRole.setUser(savedUser);
        userRoleRepository.save(userRole);

        // Send email async — failure here won't rollback
        emailService.sendVerificationEmail(request.getEmail(), otp);
        log.info("User registered: {}", request.getEmail());
    }

    // ── Step 2: Verify email OTP ──────────────────────────
    @Transactional
    public AuthResponse verifyEmail(VerifyOtpRequest request) {
        otpService.validateEmailVerificationOtp(
                request.getEmail(), request.getOtp());

        User user = getUser(request.getEmail());
        user.setIsEmailVerified(true);
        userRepository.save(user);

        log.info("Email verified: {}", request.getEmail());
        return buildAuthResponse(user);
    }

    // ── Resend OTP ────────────────────────────────────────
    public void resendOtp(String email) {
        User user = getUser(email);
        if (user.getIsEmailVerified()) {
            throw new RuntimeException("Email is already verified.");
        }
        String otp = otpService.generateEmailVerificationOtp(email);
        emailService.sendVerificationEmail(email, otp);
        log.info("OTP resent to: {}", email);
    }

    // ── Step 3: Login (initiate) ──────────────────────────
    public void login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!user.getIsEmailVerified()) {
            throw new UnverifiedAccountException(
                    "Please verify your email before logging in.");
        }

        if (!user.getIsActive()) {
            throw new UnauthorizedException(
                    "Your account has been deactivated.");
        }

        String otp = otpService.generateLoginOtp(request.getEmail());
        emailService.sendLoginOtpEmail(request.getEmail(), otp);
        log.info("Login OTP sent to: {}", request.getEmail());
    }

    // ── Step 4: Verify login OTP ──────────────────────────
    @Transactional
    public AuthResponse verifyLoginOtp(VerifyOtpRequest request) {
        otpService.validateLoginOtp(
                request.getEmail(), request.getOtp());

        User user = getUser(request.getEmail());
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login successful: {}", request.getEmail());
        return buildAuthResponse(user);
    }

    // ── Forgot password ───────────────────────────────────
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String otp = otpService.generatePasswordResetOtp(email);
            emailService.sendPasswordResetEmail(email, otp);
            log.info("Password reset OTP sent to: {}", email);
        });
    }

    // ── Reset password ────────────────────────────────────
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        otpService.validatePasswordResetOtp(
                request.getEmail(), request.getOtp());

        User user = getUser(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all existing tokens
        jwtService.deleteRefreshToken(user.getId());
        log.info("Password reset for: {}", request.getEmail());
    }

    // ── Refresh token ─────────────────────────────────────
    public AuthResponse refreshToken(String refreshToken, Long userId) {
        if (!jwtService.validateRefreshToken(userId, refreshToken)) {
            throw new UnauthorizedException(
                    "Invalid or expired refresh token.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));
        return buildAuthResponse(user);
    }

    // ── Logout ────────────────────────────────────────────
    public void logout(String token, Long userId) {
        String jti = jwtService.extractJti(token);
        long remainingMs = jwtService.getRemainingMs(token);
        jwtService.blacklistToken(jti, remainingMs);
        jwtService.deleteRefreshToken(userId);
        log.info("User logged out: userId={}", userId);
    }

    // ── Helpers ───────────────────────────────────────────
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));
    }

    private AuthResponse buildAuthResponse(User user) {
        // Force load roles to avoid LazyInitializationException
        user.getRoles().size();

        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isEmailVerified(user.getIsEmailVerified())
                .roles(user.getRoles().stream()
                        .map(r -> r.getId().getRole())
                        .collect(Collectors.toSet()))
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}