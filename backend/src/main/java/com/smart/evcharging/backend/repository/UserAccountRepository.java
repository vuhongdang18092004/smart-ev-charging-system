package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.UserAccount;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByIdAndRoleAndDeletedAtIsNull(UUID id, String role);
}
