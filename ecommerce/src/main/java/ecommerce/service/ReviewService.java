package ecommerce.service;

import ecommerce.dto.request.ReviewRequest;
import ecommerce.dto.response.ReviewResponse;
import ecommerce.entity.*;
import ecommerce.exception.*;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;
    private final UserRepository    userRepository;

    public ReviewResponse addReview(ReviewRequest request) {
        User user = getCurrentUser();

        if (reviewRepository.existsByUserIdAndOrderIdAndProductId(
                user.getId(), request.getOrderId(), request.getProductId())) {
            throw new RuntimeException(
                    "You have already reviewed this product for this order.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + request.getProductId()));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + request.getOrderId()));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You can only review products you have ordered.");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .build();

        ReviewResponse response = toResponse(reviewRepository.save(review));
        log.info("Review added: productId={} userId={}",
                request.getProductId(), user.getId());
        return response;
    }

    public Page<ReviewResponse> getProductReviews(
            Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return reviewRepository.findAllByProductId(productId, pageable)
                .map(this::toResponse);
    }

    public void deleteReview(Long id) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review not found: " + id));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You can only delete your own reviews.");
        }
        reviewRepository.deleteById(id);
        log.info("Review deleted: id={}", id);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .title(review.getTitle())
                .body(review.getBody())
                .createdAt(review.getCreatedAt())
                .build();
    }
}