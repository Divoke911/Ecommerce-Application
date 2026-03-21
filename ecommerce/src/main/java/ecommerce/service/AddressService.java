package ecommerce.service;

import ecommerce.dto.request.AddressRequest;
import ecommerce.dto.response.AddressResponse;
import ecommerce.entity.Address;
import ecommerce.entity.User;
import ecommerce.exception.ResourceNotFoundException;
import ecommerce.exception.UnauthorizedException;
import ecommerce.repository.AddressRepository;
import ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;

    // ── Get all my addresses ──────────────────────────────
    public List<AddressResponse> getMyAddresses() {
        User user = getCurrentUser();
        return addressRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get single address ────────────────────────────────
    public AddressResponse getById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found: " + id));
        checkOwnership(address);
        return toResponse(address);
    }

    // ── Add new address ───────────────────────────────────
    public AddressResponse add(AddressRequest request) {
        User user = getCurrentUser();
        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .build();
        return toResponse(addressRepository.save(address));
    }

    // ── Update address ────────────────────────────────────
    public AddressResponse update(Long id, AddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found: " + id));
        checkOwnership(address);
        address.setLabel(request.getLabel());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        return toResponse(addressRepository.save(address));
    }

    // ── Delete address (soft delete) ──────────────────────
    public void delete(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found: " + id));
        checkOwnership(address);
        address.setDeletedAt(java.time.LocalDateTime.now());
        addressRepository.save(address);
    }

    // ── Helpers ───────────────────────────────────────────
    private void checkOwnership(Address address) {
        User currentUser = getCurrentUser();
        if (!address.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to access this address.");
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .build();
    }
}