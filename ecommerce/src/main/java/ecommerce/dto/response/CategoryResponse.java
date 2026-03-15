package ecommerce.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private Long parentId;
    private String parentName;
}