package org.example.repo;

import org.example.entity.ExpenseEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepo extends CrudRepository<ExpenseEntity, Long> {

    List<ExpenseEntity> findByUserId(String userId);

    List<ExpenseEntity> findByUserIdAndCreatedAtBetween(String userId, java.sql.Timestamp start, java.sql.Timestamp end);

    Optional<ExpenseEntity> findByExternalId(String externalId);

    Optional<ExpenseEntity> findByUserIdAndExternalId(String userId, String externalId);

}
