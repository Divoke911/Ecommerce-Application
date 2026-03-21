package ecommerce.controller;

import ecommerce.dto.request.CategoryRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.CategoryResponse;
import ecommerce.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // PUBLIC — GET /api/categories
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllTopLevel() {
        return ResponseEntity.ok(
                ApiResponse.success("Categories fetched.", categoryService.getAllTopLevel()));
    }

    // PUBLIC — GET /api/categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Category fetched.", categoryService.getById(id)));
    }

    // PUBLIC — GET /api/categories/{id}/subcategories
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSubCategories(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Subcategories fetched.",
                        categoryService.getSubCategories(id)));
    }

    // ADMIN ONLY — POST /api/categories
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Category created.", categoryService.create(request)));
    }

    // ADMIN ONLY — PUT /api/categories/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Category updated.", categoryService.update(id, request)));
    }

    // ADMIN ONLY — DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted."));
    }
}