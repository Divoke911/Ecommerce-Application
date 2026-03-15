package ecommerce.dto.request;

import ecommerce.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal minOrderValue = BigDecimal.ZERO;
    private Integer maxUses;
    private LocalDateTime expiresAt;
}