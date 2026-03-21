package ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SellerProfileRequest {

    @NotBlank(message = "Store name is required")
    private String storeName;

    private String gstNumber;
    private String bankAccount;
    private String ifscCode;
}