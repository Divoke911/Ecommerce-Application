package ecommerce.service;

import ecommerce.dto.response.*;
import ecommerce.entity.*;
import ecommerce.enums.NotificationType;
import ecommerce.enums.OrderStatus;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository          userRepository;
    private final UserRoleRepository      userRoleRepository;
    private final OrderRepository         orderRepository;
    private final OrderItemRepository     orderItemRepository;
    private final ProductRepository       productRepository;
    private final TransactionRepository   transactionRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CouponRepository        couponRepository;
    private final NotificationService     notificationService;

    // ── Users ─────────────────────────────────────────────
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return userRepository.findAll(pageable)
                .map(this::toUserResponse);
    }

    public UserResponse getUserById(Long id) {
        return toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + id)));
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + id));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User deactivated by admin: userId={}", id);
    }

    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + id));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User activated by admin: userId={}", id);
    }

    @Transactional
    public void verifySeller(Long userId) {
        SellerProfile profile = sellerProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller profile not found for user: " + userId));
        profile.setIsVerified(true);
        sellerProfileRepository.save(profile);
        log.info("Seller verified by admin: userId={}", userId);
    }

    // ── Orders ────────────────────────────────────────────
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return orderRepository.findAll(pageable)
                .map(this::toOrderResponse);
    }

    public Page<OrderResponse> getOrdersByStatus(
            OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return orderRepository.findAllByStatus(status, pageable)
                .map(this::toOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + orderId));
        order.setStatus(status);
        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getUser(),
                NotificationType.ORDER_UPDATE,
                "Order Status Updated",
                "Your order #" + orderId +
                " status is now: " + status.name());

        log.info("Order status updated by admin: orderId={} status={}",
                orderId, status);
        return toOrderResponse(saved);
    }

    // ── Products ──────────────────────────────────────────
    public Page<ProductResponse> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        // Admin sees all products including inactive
        return productRepository.findAllIncludingDeleted(pageable)
                .map(this::toProductResponse);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + id));
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product deactivated by admin: productId={}", id);
    }

    @Transactional
    public void activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + id));
        product.setIsActive(true);
        productRepository.save(product);
        log.info("Product activated by admin: productId={}", id);
    }

    // ── Dashboard ─────────────────────────────────────────
    public DashboardResponse getDashboardStats() {
        long totalUsers    = userRepository.count();
        long totalOrders   = orderRepository.count();
        long totalProducts = productRepository.count();

        // Use query instead of loading all transactions
        BigDecimal totalRevenue = transactionRepository.getTotalRevenue();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalRevenue(totalRevenue)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isEmailVerified(user.getIsEmailVerified())
                .roles(user.getRoles().stream()
                        .map(r -> r.getId().getRole())
                        .collect(Collectors.toSet()))
                .build();
    }

    private OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .isActive(product.getIsActive())
                .sellerName(product.getSeller().getName())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .build())
                .build();
    }
}