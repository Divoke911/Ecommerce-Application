package ecommerce.mapper;

import ecommerce.dto.response.CategoryResponse;
import ecommerce.dto.response.ProductResponse;
import ecommerce.entity.Product;
import ecommerce.entity.ProductImage;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "sellerName",
            expression = "java(product.getSeller().getName())")
    @Mapping(target = "category",
            expression = "java(mapCategory(product))")
    @Mapping(target = "imageUrls",
            expression = "java(mapImages(product))")
    @Mapping(target = "averageRating", ignore = true)
    ProductResponse toResponse(Product product);

    default CategoryResponse mapCategory(Product product) {
        if (product.getCategory() == null) return null;
        return CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .build();
    }

    default List<String> mapImages(Product product) {
        if (product.getImages() == null) return List.of();
        return product.getImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());
    }
}