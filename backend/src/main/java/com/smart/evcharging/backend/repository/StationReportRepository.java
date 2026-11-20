package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.StationReport;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationReportRepository extends JpaRepository<StationReport, UUID> {
    Page<StationReport> findByStationIdAndStationDeletedAtIsNull(UUID stationId, Pageable pageable);

    Optional<StationReport> findByIdAndStationDeletedAtIsNull(UUID id);
}
