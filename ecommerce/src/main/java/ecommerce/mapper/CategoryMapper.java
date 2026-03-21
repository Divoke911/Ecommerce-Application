package ecommerce.mapper;

import ecommerce.dto.response.CategoryResponse;
import ecommerce.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentId",
            expression = "java(category.getParent() != null ? category.getParent().getId() : null)")
    @Mapping(target = "parentName",
            expression = "java(category.getParent() != null ? category.getParent().getName() : null)")
    CategoryResponse toResponse(Category category);
}