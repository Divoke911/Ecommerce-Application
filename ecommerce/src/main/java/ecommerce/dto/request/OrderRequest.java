package ecommerce.dto.request;

import ecommerce.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    @NotNull(message = "Billing address is required")
    private Long billingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String couponCode; // optional
}