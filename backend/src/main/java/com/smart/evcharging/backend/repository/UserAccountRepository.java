package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.UserAccount;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByIdAndRoleAndDeletedAtIsNull(UUID id, String role);

    @Query("select u from UserAccount u where lower(u.email) = lower(:email) and u.deletedAt is null")
    Optional<UserAccount> findByLoginEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UserAccount u where u.id = :id and u.role = :role and u.deletedAt is null")
    Optional<UserAccount> lockByIdAndRole(UUID id, String role);

    @Query("select count(u) > 0 from UserAccount u where lower(u.email) = lower(:email) and u.id <> :id")
    boolean existsByEmailForOtherUser(String email, UUID id);
}
