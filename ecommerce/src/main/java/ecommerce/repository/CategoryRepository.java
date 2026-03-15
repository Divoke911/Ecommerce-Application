package ecommerce.repository;

import ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findAllByParentIsNull();           // top-level categories
    List<Category> findAllByParentId(Long parentId);  // sub-categories
}