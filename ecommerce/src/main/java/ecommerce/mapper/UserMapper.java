package ecommerce.mapper;

import ecommerce.dto.response.UserResponse;
import ecommerce.entity.User;
import ecommerce.enums.Role;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(mapRoles(user))")
    UserResponse toResponse(User user);

    default Set<Role> mapRoles(User user) {
        if (user.getRoles() == null) return Set.of();
        return user.getRoles().stream()
                .map(r -> r.getId().getRole())
                .collect(Collectors.toSet());
    }
}