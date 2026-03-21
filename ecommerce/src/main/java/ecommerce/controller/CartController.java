package ecommerce.controller;

import ecommerce.dto.request.CartItemRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.CartResponse;
import ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // GET /api/cart
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart() {
        return ResponseEntity.ok(
                ApiResponse.success("Cart fetched.", cartService.getMyCart()));
    }

    // POST /api/cart/items
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Item added to cart.", cartService.addItem(request)));
    }

    // PUT /api/cart/items/{productId}
    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(
                ApiResponse.success("Cart updated.", cartService.updateItem(productId, quantity)));
    }

    // DELETE /api/cart/items/{productId}
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                ApiResponse.success("Item removed.", cartService.removeItem(productId)));
    }
}