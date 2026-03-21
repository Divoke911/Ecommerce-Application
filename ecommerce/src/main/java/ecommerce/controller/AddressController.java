package ecommerce.controller;

import ecommerce.dto.request.AddressRequest;
import ecommerce.dto.response.AddressResponse;
import ecommerce.dto.response.ApiResponse;
import ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // GET /api/addresses
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses() {
        return ResponseEntity.ok(
                ApiResponse.success("Addresses fetched.",
                        addressService.getMyAddresses()));
    }

    // GET /api/addresses/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Address fetched.",
                        addressService.getById(id)));
    }

    // POST /api/addresses
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> add(
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Address added.",
                        addressService.add(request)));
    }

    // PUT /api/addresses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Address updated.",
                        addressService.update(id, request)));
    }

    // DELETE /api/addresses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted."));
    }
}