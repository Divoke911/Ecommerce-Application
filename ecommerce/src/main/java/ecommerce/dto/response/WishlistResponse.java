package ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WishlistResponse {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String imageUrl;
}