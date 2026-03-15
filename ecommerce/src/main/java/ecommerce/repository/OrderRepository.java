package ecommerce.repository;

import ecommerce.entity.Order;
import ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByUserId(Long userId, Pageable pageable);
    Page<Order> findAllByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);
    Page<Order> findAllByStatus(OrderStatus status, Pageable pageable); // for admin
}