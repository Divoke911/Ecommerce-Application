package ecommerce.service;

import ecommerce.dto.request.ProductRequest;
import ecommerce.dto.response.CategoryResponse;
import ecommerce.dto.response.ProductResponse;
import ecommerce.entity.*;
import ecommerce.exception.*;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository      productRepository;
    private final CategoryRepository     categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository         userRepository;
    private final ReviewRepository       reviewRepository;

    @Transactional
    public ProductResponse create(ProductRequest request) {
        User seller = getCurrentUser();
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()));
        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .isActive(true)
                .build();
        Product saved = productRepository.save(product);
        log.info("Product created: {} by seller: {}",
                saved.getName(), seller.getEmail());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAll(int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        return productRepository.findByIsActiveTrue(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository
                .findByNameContainingIgnoreCase(name, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getByCategory(
            Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByCategoryId(categoryId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getMyProducts(int page, int size) {
        User seller = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findBySellerId(seller.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProductOwnedByCurrentUser(id);
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);
        log.info("Product updated: id={}", id);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = getProductOwnedByCurrentUser(id);
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product deactivated: id={}", id);
    }

    @Transactional
    public void addImage(Long productId, String url, boolean isPrimary) {
        Product product = getProductOwnedByCurrentUser(productId);
        ProductImage image = ProductImage.builder()
                .product(product)
                .url(url)
                .isPrimary(isPrimary)
                .sortOrder(0)
                .build();
        productImageRepository.save(image);
        log.info("Image added to product: productId={}", productId);
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        getProductOwnedByCurrentUser(productId);
        productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Image not found: " + imageId));
        productImageRepository.deleteById(imageId);
        log.info("Image deleted: imageId={} productId={}",
                imageId, productId);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private Product getProductOwnedByCurrentUser(Long productId) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + productId));
        if (!product.getSeller().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to modify this product.");
        }
        return product;
    }

    public ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream()
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList())
                : List.of();

        Double avgRating = reviewRepository
                .findAverageRatingByProductId(product.getId());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .isActive(product.getIsActive())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .build())
                .sellerName(product.getSeller().getName())
                .imageUrls(imageUrls)
                .averageRating(avgRating)
                .build();
    }
}