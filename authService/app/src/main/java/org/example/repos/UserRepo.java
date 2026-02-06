package org.example.repos;

import org.example.entities.UserInfo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import java.util.List;

@Repository
public interface UserRepo extends CrudRepository<UserInfo, String> {
    public List<UserInfo> findByUserName(String userName);
}
