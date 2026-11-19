package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.Station;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface StationRepository extends JpaRepository<Station, UUID>, JpaSpecificationExecutor<Station> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Station> findByIdAndDeletedAtIsNull(UUID id);
}
