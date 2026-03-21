package ecommerce.service;

import ecommerce.dto.response.WishlistResponse;
import ecommerce.entity.*;
import ecommerce.exception.*;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    public void addToWishlist(Long productId) {
        User user = getCurrentUser();

        if (wishlistRepository.existsByUserIdAndProductId(
                user.getId(), productId)) {
            throw new RuntimeException("Product already in wishlist.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + productId));

        if (!product.getIsActive()) {
            throw new ResourceNotFoundException(
                    "Product is no longer available.");
        }

        Wishlist wishlist = Wishlist.builder()
                .id(new Wishlist.WishlistId(user.getId(), productId))
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);
        log.info("Added to wishlist: userId={} productId={}",
                user.getId(), productId);
    }

    public void removeFromWishlist(Long productId) {
        User user = getCurrentUser();
        wishlistRepository.deleteByUserIdAndProductId(
                user.getId(), productId);
        log.info("Removed from wishlist: userId={} productId={}",
                user.getId(), productId);
    }

    public List<WishlistResponse> getMyWishlist() {
        User user = getCurrentUser();
        return wishlistRepository.findAllByUserId(user.getId())
                .stream()
                .map(w -> WishlistResponse.builder()
                        .productId(w.getProduct().getId())
                        .productName(w.getProduct().getName())
                        .price(w.getProduct().getPrice())
                        .imageUrl(w.getProduct().getImages() != null
                                && !w.getProduct().getImages().isEmpty()
                                ? w.getProduct().getImages().get(0).getUrl()
                                : null)
                        .build())
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }
}