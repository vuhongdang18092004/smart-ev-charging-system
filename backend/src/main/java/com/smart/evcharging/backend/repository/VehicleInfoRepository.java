package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.VehicleInfo;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface VehicleInfoRepository extends JpaRepository<VehicleInfo, UUID>, JpaSpecificationExecutor<VehicleInfo> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<VehicleInfo> findByIdAndDeletedAtIsNull(UUID id);
}
