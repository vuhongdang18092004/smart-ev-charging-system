package com.smart.evcharging.backend.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReviewResponse(UUID id, UUID stationId, UUID driverId, short rating, String comment, Short editCount,
        Instant createdAt, Instant updatedAt, List<MediaResponse> media) {}
