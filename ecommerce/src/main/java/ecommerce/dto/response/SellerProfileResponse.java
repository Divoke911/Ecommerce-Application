package ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SellerProfileResponse {
    private Long userId;
    private String storeName;
    private String gstNumber;
    private BigDecimal sellerRating;
    private Boolean isVerified;
}