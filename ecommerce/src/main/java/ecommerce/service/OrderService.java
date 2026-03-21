package ecommerce.service;

import ecommerce.dto.request.OrderRequest;
import ecommerce.dto.response.*;
import ecommerce.entity.*;
import ecommerce.enums.*;
import ecommerce.exception.*;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository       orderRepository;
    private final OrderItemRepository   orderItemRepository;
    private final CartRepository        cartRepository;
    private final CartItemRepository    cartItemRepository;
    private final AddressRepository     addressRepository;
    private final CouponRepository      couponRepository;
    private final ProductRepository     productRepository;
    private final TransactionRepository transactionRepository;
    private final DeliveryRepository    deliveryRepository;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;
    private final EmailService          emailService;

    // ── Place order ───────────────────────────────────────
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        User user = getCurrentUser();

        // Get open cart
        Cart cart = cartRepository
                .findByUserIdAndStatus(user.getId(), CartStatus.OPEN)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No open cart found. Add items first."));

        List<CartItem> cartItems =
                cartItemRepository.findAllByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new ResourceNotFoundException("Cart is empty.");
        }

        // Validate shipping address ownership
        Address shippingAddress = addressRepository
                .findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipping address not found."));
        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "Shipping address does not belong to you.");
        }

        // Validate billing address ownership
        Address billingAddress = addressRepository
                .findById(request.getBillingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Billing address not found."));
        if (!billingAddress.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "Billing address does not belong to you.");
        }

        // Validate all products are active and have enough stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (!product.getIsActive()) {
                throw new ResourceNotFoundException(
                        product.getName() + " is no longer available.");
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new OutOfStockException(
                        product.getName() + " has only " +
                        product.getStock() + " units available.");
            }
        }

        // Calculate total
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = null;

        if (request.getCouponCode() != null &&
                !request.getCouponCode().isBlank()) {
            coupon = couponRepository
                    .findByCodeAndIsActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Invalid or expired coupon."));

            // Check max uses
            if (coupon.getMaxUses() != null &&
                    coupon.getUsedCount() >= coupon.getMaxUses()) {
                throw new ResourceNotFoundException(
                        "Coupon has reached its maximum usage limit.");
            }

            // Check expiry
            if (coupon.getExpiresAt() != null &&
                    coupon.getExpiresAt()
                            .isBefore(java.time.LocalDateTime.now())) {
                throw new ResourceNotFoundException(
                        "Coupon has expired.");
            }

            // Check min order value
            if (totalAmount.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new ResourceNotFoundException(
                        "Minimum order value for this coupon is ₹" +
                        coupon.getMinOrderValue());
            }

            // Calculate discount
            if (coupon.getDiscountType() == DiscountType.FLAT) {
                discountAmount = coupon.getDiscountValue();
            } else {
                discountAmount = totalAmount
                        .multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Create order
        Order order = Order.builder()
                .user(user)
                .cart(cart)
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .coupon(coupon)
                .status(OrderStatus.PLACED)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .build();
        orderRepository.save(order);

        // Create order items + deduct stock atomically
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();
            orderItemRepository.save(orderItem);
        }

        // Create transaction
        Transaction transaction = Transaction.builder()
                .order(order)
                .user(user)
                .amount(finalAmount)
                .paymentMethod(request.getPaymentMethod())
                .transactionStatus(
                        request.getPaymentMethod() == PaymentMethod.COD
                                ? TransactionStatus.PENDING
                                : TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(transaction);

        // Create delivery
        Delivery delivery = Delivery.builder()
                .order(order)
                .address(shippingAddress)
                .deliveryStatus(DeliveryStatus.SCHEDULED)
                .scheduledDate(LocalDate.now().plusDays(5))
                .build();
        deliveryRepository.save(delivery);

        // Mark cart as checked out
        cart.setStatus(CartStatus.CHECKED_OUT);
        cartRepository.save(cart);

        // Send notification
        notificationService.createNotification(
                user,
                NotificationType.ORDER_UPDATE,
                "Order Placed Successfully!",
                "Your order #" + order.getId() +
                " has been placed. Total: ₹" + finalAmount);

        // Send confirmation email
        emailService.sendOrderConfirmationEmail(
                user.getEmail(), order.getId(), finalAmount);

        log.info("Order placed: orderId={} userId={}",
                order.getId(), user.getId());
        return toResponse(order);
    }

    // ── Get my orders ─────────────────────────────────────
    public Page<OrderResponse> getMyOrders(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return orderRepository.findAllByUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    // ── Get order by ID ───────────────────────────────────
    public OrderResponse getById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + id));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this order.");
        }
        return toResponse(order);
    }

    // ── Cancel order ──────────────────────────────────────
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + id));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to cancel this order.");
        }

        if (order.getStatus() != OrderStatus.PLACED &&
                order.getStatus() != OrderStatus.PROCESSING) {
            throw new RuntimeException(
                    "Order cannot be cancelled at this stage.");
        }

        // Restore stock
        List<OrderItem> items =
                orderItemRepository.findAllByOrderId(order.getId());
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // Send notification
        notificationService.createNotification(
                user,
                NotificationType.ORDER_UPDATE,
                "Order Cancelled",
                "Your order #" + order.getId() +
                " has been cancelled.");

        // Send cancellation email
        emailService.sendOrderCancelledEmail(
                user.getEmail(), order.getId());

        log.info("Order cancelled: orderId={} userId={}",
                id, user.getId());
        return toResponse(saved);
    }

    // ── Admin: update order status ────────────────────────
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + id));
        order.setStatus(status);
        Order saved = orderRepository.save(order);

        // Send notification
        notificationService.createNotification(
                order.getUser(),
                NotificationType.ORDER_UPDATE,
                "Order Status Updated",
                "Your order #" + id +
                " status is now: " + status.name());

        // Send status email
        emailService.sendOrderStatusEmail(
                order.getUser().getEmail(),
                order.getId(),
                status.name());

        log.info("Order status updated: orderId={} status={}", id, status);
        return toResponse(saved);
    }

    // ── Get delivery for order ────────────────────────────
    public DeliveryResponse getDelivery(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this delivery.");
        }

        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found for order: " + orderId));

        return DeliveryResponse.builder()
                .id(delivery.getId())
                .deliveryStatus(delivery.getDeliveryStatus())
                .trackingId(delivery.getTrackingId())
                .courierPartner(delivery.getCourierPartner())
                .scheduledDate(delivery.getScheduledDate())
                .deliveredDate(delivery.getDeliveredDate())
                .build();
    }

    // ── Get transaction for order ─────────────────────────
    public TransactionResponse getTransaction(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this transaction.");
        }

        Transaction transaction = transactionRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found for order: " + orderId));

        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .transactionStatus(transaction.getTransactionStatus())
                .gatewayRefId(transaction.getGatewayRefId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItem> items =
                orderItemRepository.findAllByOrderId(order.getId());
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice()
                                .multiply(BigDecimal.valueOf(
                                        item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .couponCode(order.getCoupon() != null
                        ? order.getCoupon().getCode() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }
}