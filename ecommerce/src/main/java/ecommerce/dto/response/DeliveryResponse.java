package ecommerce.dto.response;

import ecommerce.enums.DeliveryStatus;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DeliveryResponse {
    private Long id;
    private Long orderId;
    private DeliveryStatus deliveryStatus;
    private String trackingId;
    private String courierPartner;
    private LocalDate scheduledDate;
    private LocalDate deliveredDate;
}