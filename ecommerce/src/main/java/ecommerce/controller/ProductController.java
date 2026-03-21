package ecommerce.controller;

import ecommerce.dto.request.ProductRequest;
import ecommerce.dto.response.ApiResponse;
import ecommerce.dto.response.ProductResponse;
import ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "10")    int size,
            @RequestParam(defaultValue = "price") String sort) {
        return ResponseEntity.ok(
                ApiResponse.success("Products fetched.",
                        productService.getAll(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Product fetched.",
                        productService.getById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> search(
            @RequestParam String name,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Search results.",
                        productService.search(name, page, size)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Products fetched.",
                        productService.getByCategory(categoryId, page, size)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getMyProducts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success("Your products.",
                        productService.getMyProducts(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Product created.",
                        productService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Product updated.",
                        productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted."));
    }

    // ── Image endpoints ───────────────────────────────────

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> addImage(
            @PathVariable Long id,
            @RequestParam String url,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        productService.addImage(id, url, isPrimary);
        return ResponseEntity.ok(ApiResponse.success("Image added."));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        productService.deleteImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted."));
    }
}