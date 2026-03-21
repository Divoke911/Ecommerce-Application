package ecommerce.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AddressResponse {
    private Long id;
    private String label;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}