package ecommerce.repository;

import ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository
        extends JpaRepository<Product, Long> {

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(
            String name, Pageable pageable);

    Page<Product> findByIsActiveTrue(Pageable pageable);

    // Admin — see all products including soft deleted
    @Query(value = "SELECT p FROM Product p",
           countQuery = "SELECT COUNT(p) FROM Product p")
    Page<Product> findAllIncludingDeleted(Pageable pageable);
}