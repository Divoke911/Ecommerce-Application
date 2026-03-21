package ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalUsers;
    private Long totalOrders;
    private Long totalProducts;
    private BigDecimal totalRevenue;
}