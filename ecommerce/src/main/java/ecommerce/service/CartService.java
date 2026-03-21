package ecommerce.service;

import ecommerce.dto.request.CartItemRequest;
import ecommerce.dto.response.*;
import ecommerce.entity.*;
import ecommerce.enums.CartStatus;
import ecommerce.exception.*;
import ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository     cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    private static final int MAX_CART_ITEMS    = 20;
    private static final int MAX_ITEM_QUANTITY = 10;

    public CartResponse getMyCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(CartItemRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found: " + request.getProductId()));

        if (!product.getIsActive()) {
            throw new ResourceNotFoundException(
                    product.getName() + " is no longer available.");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new OutOfStockException(
                    "Only " + product.getStock() + " units available.");
        }

        if (request.getQuantity() > MAX_ITEM_QUANTITY) {
            throw new RuntimeException(
                    "Maximum " + MAX_ITEM_QUANTITY +
                    " units allowed per item.");
        }

        var existingItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();

            if (newQty > MAX_ITEM_QUANTITY) {
                throw new RuntimeException(
                        "Maximum " + MAX_ITEM_QUANTITY +
                        " units allowed per item.");
            }
            if (product.getStock() < newQty) {
                throw new OutOfStockException(
                        "Only " + product.getStock() + " units available.");
            }

            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            List<CartItem> currentItems =
                    cartItemRepository.findAllByCartId(cart.getId());
            if (currentItems.size() >= MAX_CART_ITEMS) {
                throw new RuntimeException(
                        "Cart cannot have more than " +
                        MAX_CART_ITEMS + " items.");
            }

            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            cartItemRepository.save(item);
        }

        log.info("Item added to cart: userId={} productId={}",
                user.getId(), product.getId());
        return toResponse(
                cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse updateItem(Long productId, Integer quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found in cart."));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            log.info("Item removed from cart: userId={} productId={}",
                    user.getId(), productId);
        } else {
            if (quantity > MAX_ITEM_QUANTITY) {
                throw new RuntimeException(
                        "Maximum " + MAX_ITEM_QUANTITY +
                        " units allowed per item.");
            }

            Product product = item.getProduct();
            if (!product.getIsActive()) {
                throw new ResourceNotFoundException(
                        product.getName() + " is no longer available.");
            }
            if (product.getStock() < quantity) {
                throw new OutOfStockException(
                        "Only " + product.getStock() + " units available.");
            }

            item.setQuantity(quantity);
            cartItemRepository.save(item);
            log.info("Cart item updated: userId={} productId={} qty={}",
                    user.getId(), productId, quantity);
        }

        return toResponse(
                cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse removeItem(Long productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteByCartIdAndProductId(
                cart.getId(), productId);
        log.info("Item removed from cart: userId={} productId={}",
                user.getId(), productId);
        return toResponse(
                cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public void clearCart(Cart cart) {
        List<CartItem> items =
                cartItemRepository.findAllByCartId(cart.getId());
        cartItemRepository.deleteAll(items);
        log.info("Cart cleared: cartId={}", cart.getId());
    }

    public Cart getOpenCart(User user) {
        return cartRepository
                .findByUserIdAndStatus(user.getId(), CartStatus.OPEN)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No open cart found."));
    }

    // ── Race condition safe cart creation ─────────────────
    private Cart getOrCreateCart(User user) {
        return cartRepository
                .findByUserIdAndStatus(user.getId(), CartStatus.OPEN)
                .orElseGet(() -> {
                    try {
                        return cartRepository.save(
                                Cart.builder()
                                        .user(user)
                                        .status(CartStatus.OPEN)
                                        .build());
                    } catch (DataIntegrityViolationException e) {
                        return cartRepository
                                .findByUserIdAndStatus(
                                        user.getId(), CartStatus.OPEN)
                                .orElseThrow();
                    }
                });
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));
    }

    public CartResponse toResponse(Cart cart) {
        List<CartItem> items =
                cartItemRepository.findAllByCartId(cart.getId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImage(
                                item.getProduct().getImages() != null
                                && !item.getProduct().getImages().isEmpty()
                                        ? item.getProduct().getImages()
                                            .get(0).getUrl()
                                        : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice()
                                .multiply(BigDecimal.valueOf(
                                        item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalAmount(total)
                .totalItems(itemResponses.size())
                .build();
    }
}