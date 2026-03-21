package ecommerce.dto.request;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String phone;
}