package ecommerce.controller;

import ecommerce.dto.request.SellerProfileRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.SellerProfileResponse;
import ecommerce.service.SellerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    // POST /api/seller/profile
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> create(
            @Valid @RequestBody SellerProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Seller profile created.",
                        sellerProfileService.create(request)));
    }

    // GET /api/seller/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(
                ApiResponse.success("Seller profile fetched.",
                        sellerProfileService.getMyProfile()));
    }

    // GET /api/seller/profile/{userId}
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> getByUserId(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Seller profile fetched.",
                        sellerProfileService.getByUserId(userId)));
    }

    // PUT /api/seller/profile
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> update(
            @RequestBody SellerProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Seller profile updated.",
                        sellerProfileService.update(request)));
    }
}