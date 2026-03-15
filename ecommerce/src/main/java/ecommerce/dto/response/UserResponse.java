package ecommerce.dto.response;

import ecommerce.enums.Role;
import lombok.*;
import java.util.Set;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Boolean isEmailVerified;
    private Set<Role> roles;
}