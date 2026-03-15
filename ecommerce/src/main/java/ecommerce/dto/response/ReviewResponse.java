package ecommerce.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private String userName;
    private Integer rating;
    private String title;
    private String body;
    private LocalDateTime createdAt;
}