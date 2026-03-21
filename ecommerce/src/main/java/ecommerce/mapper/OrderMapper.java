package ecommerce.mapper;

import ecommerce.dto.response.OrderItemResponse;
import ecommerce.dto.response.OrderResponse;
import ecommerce.entity.Order;
import ecommerce.entity.OrderItem;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "productId",
            expression = "java(item.getProduct().getId())")
    @Mapping(target = "productName",
            expression = "java(item.getProduct().getName())")
    @Mapping(target = "subtotal",
            expression = "java(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))")
    OrderItemResponse toItemResponse(OrderItem item);

    default OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .couponCode(order.getCoupon() != null
                        ? order.getCoupon().getCode() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }
}