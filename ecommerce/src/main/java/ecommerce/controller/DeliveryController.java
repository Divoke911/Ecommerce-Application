package ecommerce.controller;

import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.DeliveryResponse;
import ecommerce.entity.Delivery;
import ecommerce.entity.User;
import ecommerce.enums.DeliveryStatus;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.exception.UnauthorizedException;
import ecommerce.repository.DeliveryRepository;
import ecommerce.repository.OrderRepository;
import ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository    orderRepository;
    private final UserRepository     userRepository;

    // GET /api/deliveries/order/{orderId}
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getByOrderId(
            @PathVariable Long orderId) {
        User user = getCurrentUser();

        // Verify order belongs to user
        orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new UnauthorizedException(
                        "You are not authorized to view this delivery."));

        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found for order: " + orderId));

        return ResponseEntity.ok(
                ApiResponse.success("Delivery fetched.",
                        toResponse(delivery)));
    }

    // ADMIN — PUT /api/deliveries/{id}/status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status,
            @RequestParam(required = false) String trackingId,
            @RequestParam(required = false) String courierPartner) {

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found: " + id));

        delivery.setDeliveryStatus(status);
        if (trackingId != null)     delivery.setTrackingId(trackingId);
        if (courierPartner != null) delivery.setCourierPartner(courierPartner);

        if (status == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredDate(java.time.LocalDate.now());
        }

        Delivery saved = deliveryRepository.save(delivery);
        log.info("Delivery status updated: id={} status={}", id, status);

        return ResponseEntity.ok(
                ApiResponse.success("Delivery status updated.",
                        toResponse(saved)));
    }

    // ADMIN — PUT /api/deliveries/{id}/tracking
    @PutMapping("/{id}/tracking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateTracking(
            @PathVariable Long id,
            @RequestParam String trackingId,
            @RequestParam String courierPartner) {

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found: " + id));

        delivery.setTrackingId(trackingId);
        delivery.setCourierPartner(courierPartner);
        Delivery saved = deliveryRepository.save(delivery);

        log.info("Tracking updated: id={} trackingId={}", id, trackingId);
        return ResponseEntity.ok(
                ApiResponse.success("Tracking info updated.",
                        toResponse(saved)));
    }

    // ── Helper ────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private DeliveryResponse toResponse(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .deliveryStatus(delivery.getDeliveryStatus())
                .trackingId(delivery.getTrackingId())
                .courierPartner(delivery.getCourierPartner())
                .scheduledDate(delivery.getScheduledDate())
                .deliveredDate(delivery.getDeliveredDate())
                .build();
    }
}