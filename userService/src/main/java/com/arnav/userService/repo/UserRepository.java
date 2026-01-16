package com.arnav.userService.repo;


import com.arnav.userService.entities.UserInfoDto;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserInfoDto, String> {

    Optional<UserInfoDto> findByEmail(String email);
}
