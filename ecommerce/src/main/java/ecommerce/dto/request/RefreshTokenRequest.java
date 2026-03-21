package ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RefreshTokenRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}