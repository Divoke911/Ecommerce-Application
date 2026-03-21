package ecommerce.dto.response;

import ecommerce.enums.PaymentMethod;
import ecommerce.enums.TransactionStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private TransactionStatus transactionStatus;
    private String gatewayRefId;
    private LocalDateTime createdAt;
}