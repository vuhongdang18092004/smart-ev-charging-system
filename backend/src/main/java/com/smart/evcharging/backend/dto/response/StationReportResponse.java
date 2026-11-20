package com.smart.evcharging.backend.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record StationReportResponse(UUID id, UUID stationId, UUID driverId, UUID connectorTypeId, String issueType, String note,
        String status, Instant createdAt, Instant updatedAt, List<MediaResponse> media) {}
