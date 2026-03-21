package ecommerce.controller;

import ecommerce.dto.request.ReviewRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.ReviewResponse;
import ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Review added.", reviewService.addReview(request)));
    }

    // GET /api/reviews/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Reviews fetched.",
                        reviewService.getProductReviews(productId, page, size)));
    }

    // DELETE /api/reviews/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted."));
    }
}