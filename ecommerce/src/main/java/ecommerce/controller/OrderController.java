package ecommerce.controller;

import ecommerce.dto.request.OrderRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.OrderResponse;
import ecommerce.enums.OrderStatus;
import ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Order placed successfully.",
                        orderService.placeOrder(request)));
    }

    // GET /api/orders
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders fetched.",
                        orderService.getMyOrders(page, size)));
    }

    // GET /api/orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Order fetched.", orderService.getById(id)));
    }

    // PUT /api/orders/{id}/cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Order cancelled.", orderService.cancelOrder(id)));
    }

    // ADMIN — PUT /api/orders/{id}/status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Order status updated.",
                        orderService.updateStatus(id, status)));
    }
}