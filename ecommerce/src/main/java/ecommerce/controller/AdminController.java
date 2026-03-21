package ecommerce.controller;

import ecommerce.dto.request.CouponRequest;
import ecommerce.dto.response.*;
import ecommerce.entity.Coupon;
import ecommerce.enums.OrderStatus;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.repository.CouponRepository;
import ecommerce.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService     adminService;
    private final CouponRepository couponRepository;

    // ── Dashboard ─────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard stats.",
                        adminService.getDashboardStats()));
    }

    // ── Users ─────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Users fetched.",
                        adminService.getAllUsers(page, size)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User fetched.",
                        adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(
            @PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated."));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(
            @PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User activated."));
    }

    @PutMapping("/sellers/{userId}/verify")
    public ResponseEntity<ApiResponse<Void>> verifySeller(
            @PathVariable Long userId) {
        adminService.verifySeller(userId);
        return ResponseEntity.ok(ApiResponse.success("Seller verified."));
    }

    // ── Orders ────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders fetched.",
                        adminService.getAllOrders(page, size)));
    }

    @GetMapping("/orders/status")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrdersByStatus(
            @RequestParam OrderStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders fetched.",
                        adminService.getOrdersByStatus(status, page, size)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Order status updated.",
                        adminService.updateOrderStatus(id, status)));
    }

    // ── Products ──────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Products fetched.",
                        adminService.getAllProducts(page, size)));
    }

    @PutMapping("/products/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateProduct(
            @PathVariable Long id) {
        adminService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated."));
    }

    @PutMapping("/products/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateProduct(
            @PathVariable Long id) {
        adminService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product activated."));
    }

    // ── Coupons ───────────────────────────────────────────

    // GET /api/admin/coupons
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<Page<CouponResponse>>> getAllCoupons(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        Page<CouponResponse> coupons = couponRepository.findAll(pageable)
                .map(this::toCouponResponse);
        return ResponseEntity.ok(
                ApiResponse.success("Coupons fetched.", coupons));
    }

    // GET /api/admin/coupons/{id}
    @GetMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(
            @PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coupon not found: " + id));
        return ResponseEntity.ok(
                ApiResponse.success("Coupon fetched.",
                        toCouponResponse(coupon)));
    }

    // POST /api/admin/coupons
    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null
                        ? request.getMinOrderValue()
                        : BigDecimal.ZERO)
                .maxUses(request.getMaxUses())
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .usedCount(0)
                .build();
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(
                ApiResponse.success("Coupon created.",
                        toCouponResponse(saved)));
    }

    // PUT /api/admin/coupons/{id}
    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coupon not found: " + id));
        coupon.setCode(request.getCode());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderValue() != null)
            coupon.setMinOrderValue(request.getMinOrderValue());
        if (request.getMaxUses() != null)
            coupon.setMaxUses(request.getMaxUses());
        if (request.getExpiresAt() != null)
            coupon.setExpiresAt(request.getExpiresAt());
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(
                ApiResponse.success("Coupon updated.",
                        toCouponResponse(saved)));
    }

    // DELETE /api/admin/coupons/{id}
    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            @PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coupon not found: " + id));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated."));
    }

    // ── Helper ────────────────────────────────────────────
    private CouponResponse toCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxUses(coupon.getMaxUses())
                .usedCount(coupon.getUsedCount())
                .isActive(coupon.getIsActive())
                .expiresAt(coupon.getExpiresAt())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}