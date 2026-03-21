package ecommerce.controller;

import ecommerce.dto.request.*;
import ecommerce.dto.response.*;
import ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        // POST /api/auth/register
        @PostMapping("/register")
        public ResponseEntity<ApiResponse<Void>> register(
                        @Valid @RequestBody RegisterRequest request) {
                authService.register(request);
                return ResponseEntity.ok(
                                ApiResponse.success("Registration successful. Please check your email for the OTP."));
        }

        // POST /api/auth/verify-email
        @PostMapping("/verify-email")
        public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(
                        @Valid @RequestBody VerifyOtpRequest request) {
                AuthResponse response = authService.verifyEmail(request);
                return ResponseEntity.ok(
                                ApiResponse.success("Email verified successfully.", response));
        }

        // POST /api/auth/resend-otp
        @PostMapping("/resend-otp")
        public ResponseEntity<ApiResponse<Void>> resendOtp(
                        @RequestParam String email) {
                authService.resendOtp(email);
                return ResponseEntity.ok(
                                ApiResponse.success("OTP resent successfully. Please check your email."));
        }

        // POST /api/auth/login
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<Void>> login(
                        @Valid @RequestBody LoginRequest request) {
                authService.login(request);
                return ResponseEntity.ok(
                                ApiResponse.success("OTP sent to your email. Please verify to complete login."));
        }

        // POST /api/auth/verify-login-otp
        @PostMapping("/verify-login-otp")
        public ResponseEntity<ApiResponse<AuthResponse>> verifyLoginOtp(
                        @Valid @RequestBody VerifyOtpRequest request) {
                AuthResponse response = authService.verifyLoginOtp(request);
                return ResponseEntity.ok(
                                ApiResponse.success("Login successful.", response));
        }

        // POST /api/auth/forgot-password
        @PostMapping("/forgot-password")
        public ResponseEntity<ApiResponse<Void>> forgotPassword(
                        @RequestParam String email) {
                authService.forgotPassword(email);
                return ResponseEntity.ok(
                                ApiResponse.success("If this email exists, an OTP has been sent."));
        }

        // POST /api/auth/reset-password
        @PostMapping("/reset-password")
        public ResponseEntity<ApiResponse<Void>> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {
                authService.resetPassword(request);
                return ResponseEntity.ok(
                                ApiResponse.success("Password reset successfully. Please login."));
        }

        // POST /api/auth/refresh
        // POST /api/auth/refresh
        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<AuthResponse>> refresh(
                        @Valid @RequestBody RefreshTokenRequest request) {
                AuthResponse response = authService.refreshToken(
                                request.getRefreshToken(), request.getUserId());
                return ResponseEntity.ok(
                                ApiResponse.success("Token refreshed successfully.", response));
        }

        // POST /api/auth/logout
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout(
                        @RequestHeader("Authorization") String authHeader,
                        @RequestParam Long userId) {
                String token = authHeader.substring(7);
                authService.logout(token, userId);
                return ResponseEntity.ok(ApiResponse.success("Logged out successfully."));
        }
}