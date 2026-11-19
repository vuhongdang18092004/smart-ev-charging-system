package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.*;
import com.smart.evcharging.backend.dto.response.*;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface StationService {
    PaginatedResponse<StationResponse> search(StationFilter filter, Pageable pageable);
    StationDetailResponse detail(UUID id);
    StationDetailResponse create(CreateStationRequest request);
    StationResponse update(UUID id, StationRequest request);
    void deleteById(UUID id);
    ConnectorResponse addConnector(UUID stationId, ConnectorRequest request);
    ConnectorResponse updateConnector(UUID id, ConnectorRequest request);
    void deleteConnector(UUID id);
}
