package ecommerce.repository;

import ecommerce.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByOrderId(Long orderId);

    List<Transaction> findAllByUserId(Long userId);

    Page<Transaction> findAll(Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.transactionStatus = 'SUCCESS'")
    BigDecimal getTotalRevenue();
}