package ecommerce.controller;

import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.TransactionResponse;
import ecommerce.entity.Transaction;
import ecommerce.entity.User;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.exception.UnauthorizedException;
import ecommerce.repository.TransactionRepository;
import ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository        userRepository;

    // GET /api/transactions/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getMyTransactions() {
        User user = getCurrentUser();
        List<TransactionResponse> transactions = transactionRepository
                .findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(
                ApiResponse.success("Transactions fetched.", transactions));
    }

    // GET /api/transactions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getById(
            @PathVariable Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this transaction.");
        }

        return ResponseEntity.ok(
                ApiResponse.success("Transaction fetched.",
                        toResponse(transaction)));
    }

    // GET /api/transactions/order/{orderId}
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getByOrderId(
            @PathVariable Long orderId) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found for order: " + orderId));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this transaction.");
        }

        return ResponseEntity.ok(
                ApiResponse.success("Transaction fetched.",
                        toResponse(transaction)));
    }

    // ADMIN — GET /api/transactions
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getAllTransactions(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        Page<TransactionResponse> transactions = transactionRepository
                .findAll(pageable)
                .map(this::toResponse);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions fetched.", transactions));
    }

    // ── Helper ────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .transactionStatus(transaction.getTransactionStatus())
                .gatewayRefId(transaction.getGatewayRefId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}