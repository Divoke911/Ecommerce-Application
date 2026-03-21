package ecommerce.service;

import ecommerce.dto.request.CategoryRequest;
import ecommerce.dto.response.CategoryResponse;
import ecommerce.entity.Category;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse create(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .parent(request.getParentId() != null
                        ? categoryRepository.findById(request.getParentId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Parent category not found: " + request.getParentId()))
                        : null)
                .build();
        CategoryResponse response = toResponse(categoryRepository.save(category));
        log.info("Category created: {}", category.getName());
        return response;
    }

    public List<CategoryResponse> getAllTopLevel() {
        return categoryRepository.findAllByParentIsNull()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getSubCategories(Long parentId) {
        categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + parentId));
        return categoryRepository.findAllByParentId(parentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getById(Long id) {
        return toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + id)));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + id));
        category.setName(request.getName());
        category.setParent(request.getParentId() != null
                ? categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent category not found: " + request.getParentId()))
                : null);
        CategoryResponse response = toResponse(categoryRepository.save(category));
        log.info("Category updated: id={}", id);
        return response;
    }

    public void delete(Long id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + id));
        categoryRepository.deleteById(id);
        log.info("Category deleted: id={}", id);
    }

    public Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null
                        ? category.getParent().getId() : null)
                .parentName(category.getParent() != null
                        ? category.getParent().getName() : null)
                .build();
    }
}