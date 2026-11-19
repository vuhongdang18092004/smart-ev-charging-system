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
}
