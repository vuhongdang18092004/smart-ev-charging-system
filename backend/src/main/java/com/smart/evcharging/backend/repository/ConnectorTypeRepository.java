package com.smart.evcharging.backend.repository;

import com.smart.evcharging.backend.entity.ConnectorType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;

public interface ConnectorTypeRepository extends JpaRepository<ConnectorType, UUID> {
    List<ConnectorType> findAllByOrderBySortOrderAscNameAsc();
    boolean existsByCodeAndIdNot(String code, UUID id);
}
