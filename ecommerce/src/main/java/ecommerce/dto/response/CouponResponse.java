package ecommerce.dto.response;

import ecommerce.enums.DiscountType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private Integer maxUses;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}