package ecommerce.service;

import ecommerce.dto.request.SellerProfileRequest;
import ecommerce.dto.response.SellerProfileResponse;
import ecommerce.entity.*;
import ecommerce.enums.Role;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRoleRepository      userRoleRepository;
    private final UserService             userService;

    @Transactional
    public SellerProfileResponse create(SellerProfileRequest request) {
        User user = userService.getCurrentUser();

        if (sellerProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Seller profile already exists.");
        }

        // Assign SELLER role
        UserRole.UserRoleId roleId =
                new UserRole.UserRoleId(user.getId(), Role.SELLER);
        if (!userRoleRepository.existsById(roleId)) {
            UserRole sellerRole = new UserRole();
            sellerRole.setId(roleId);
            sellerRole.setUser(user);
            userRoleRepository.save(sellerRole);
        }

        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .storeName(request.getStoreName())
                .gstNumber(request.getGstNumber())
                .bankAccount(request.getBankAccount())
                .ifscCode(request.getIfscCode())
                .isVerified(false)
                .build();

        SellerProfileResponse response =
                toResponse(sellerProfileRepository.save(profile));
        log.info("Seller profile created: userId={}", user.getId());
        return response;
    }

    public SellerProfileResponse getMyProfile() {
        User user = userService.getCurrentUser();
        SellerProfile profile = sellerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller profile not found. Please create one first."));
        return toResponse(profile);
    }

    public SellerProfileResponse getByUserId(Long userId) {
        SellerProfile profile = sellerProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found: " + userId));
        return toResponse(profile);
    }

    @Transactional
    public SellerProfileResponse update(SellerProfileRequest request) {
        User user = userService.getCurrentUser();
        SellerProfile profile = sellerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller profile not found."));

        if (request.getStoreName() != null)
            profile.setStoreName(request.getStoreName());
        if (request.getGstNumber() != null)
            profile.setGstNumber(request.getGstNumber());
        if (request.getBankAccount() != null)
            profile.setBankAccount(request.getBankAccount());
        if (request.getIfscCode() != null)
            profile.setIfscCode(request.getIfscCode());

        SellerProfileResponse response =
                toResponse(sellerProfileRepository.save(profile));
        log.info("Seller profile updated: userId={}", user.getId());
        return response;
    }

    private SellerProfileResponse toResponse(SellerProfile profile) {
        return SellerProfileResponse.builder()
                .userId(profile.getUserId())
                .storeName(profile.getStoreName())
                .gstNumber(profile.getGstNumber())
                .sellerRating(profile.getSellerRating())
                .isVerified(profile.getIsVerified())
                .build();
    }
}