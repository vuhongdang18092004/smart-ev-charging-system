package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.UserVehicle;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

public interface UserVehicleRepository extends JpaRepository<UserVehicle, UUID> {
    Page<UserVehicle> findByUserIdAndDeletedAtIsNull(UUID userId, Pageable pageable);

    boolean existsByVehicleInfoIdAndDeletedAtIsNull(UUID vehicleInfoId);

    Optional<UserVehicle> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserVehicle> findForUpdateByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);
}
