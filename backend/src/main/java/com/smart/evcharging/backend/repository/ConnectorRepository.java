package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.Connector;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface ConnectorRepository extends JpaRepository<Connector, UUID> {
    List<Connector> findByStationIdOrderById(UUID stationId);

    @Query("select c.station.id from Connector c where c.id = :id")
    Optional<UUID> findStationId(UUID id);

    @Query("select c.code from Connector c where c.station.id = :stationId and c.code is not null")
    List<String> findCodesByStationId(UUID stationId);

    boolean existsByStationIdAndCodeAndIdNot(UUID stationId, String code, UUID id);
}
