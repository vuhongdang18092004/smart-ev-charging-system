package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.StationReportRequest;
import com.smart.evcharging.backend.dto.response.PaginatedResponse;
import com.smart.evcharging.backend.dto.response.StationReportResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface StationReportService {
    StationReportResponse create(UUID stationId, StationReportRequest request);
    StationReportResponse detail(UUID id);
    PaginatedResponse<StationReportResponse> list(UUID stationId, Pageable pageable);
}
