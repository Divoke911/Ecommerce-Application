package ecommerce.controller;

import ecommerce.dto.request.ChangePasswordRequest;
import ecommerce.dto.request.UpdateProfileRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.SellerProfileResponse;
import ecommerce.dto.response.UserResponse;
import ecommerce.service.SellerProfileService;
import ecommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService          userService;
    private final SellerProfileService sellerProfileService;

    // GET /api/users/me
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched.",
                        userService.getMyProfile()));
    }

    // PUT /api/users/me
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated.",
                        userService.updateProfile(
                                request.getName(),
                                request.getPhone())));
    }

    // PUT /api/users/me/change-password
    @PutMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(
                request.getOldPassword(),
                request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully."));
    }

    // DELETE /api/users/me
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount() {
        userService.deactivateAccount();
        return ResponseEntity.ok(
                ApiResponse.success("Account deactivated successfully."));
    }

    // GET /api/users/{id}/seller-profile (public)
    @GetMapping("/{id}/seller-profile")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> getSellerProfile(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Seller profile fetched.",
                        sellerProfileService.getByUserId(id)));
    }
}