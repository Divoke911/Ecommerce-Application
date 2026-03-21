package ecommerce.mapper;

import ecommerce.dto.response.CartItemResponse;
import ecommerce.dto.response.CartResponse;
import ecommerce.entity.Cart;
import ecommerce.entity.CartItem;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "productId",
            expression = "java(item.getProduct().getId())")
    @Mapping(target = "productName",
            expression = "java(item.getProduct().getName())")
    @Mapping(target = "productImage",
            expression = "java(mapImage(item))")
    @Mapping(target = "subtotal",
            expression = "java(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))")
    CartItemResponse toItemResponse(CartItem item);

    default String mapImage(CartItem item) {
        if (item.getProduct().getImages() == null ||
                item.getProduct().getImages().isEmpty()) return null;
        return item.getProduct().getImages().get(0).getUrl();
    }

    default CartResponse toResponse(Cart cart, List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalAmount(total)
                .totalItems(itemResponses.size())
                .build();
    }
}