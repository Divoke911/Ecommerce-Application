package ecommerce.mapper;

import ecommerce.dto.response.ReviewResponse;
import ecommerce.entity.Review;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "userName",
            expression = "java(review.getUser().getName())")
    ReviewResponse toResponse(Review review);
}