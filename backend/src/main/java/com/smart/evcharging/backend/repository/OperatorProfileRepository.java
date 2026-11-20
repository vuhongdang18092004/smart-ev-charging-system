package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.OperatorProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface OperatorProfileRepository extends JpaRepository<OperatorProfile, UUID> {
    @EntityGraph(attributePaths = {"user", "user.allowedBrands"})
    List<OperatorProfile> findByUserRoleAndUserDeletedAtIsNullOrderByUserNameAsc(String role);
}
