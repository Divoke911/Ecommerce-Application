package ecommerce.controller;

import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.WishlistResponse;
import ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // GET /api/wishlist
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getMyWishlist() {
        return ResponseEntity.ok(
                ApiResponse.success("Wishlist fetched.",
                        wishlistService.getMyWishlist()));
    }

    // POST /api/wishlist/{productId}
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> add(@PathVariable Long productId) {
        wishlistService.addToWishlist(productId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist."));
    }

    // DELETE /api/wishlist/{productId}
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist."));
    }
}