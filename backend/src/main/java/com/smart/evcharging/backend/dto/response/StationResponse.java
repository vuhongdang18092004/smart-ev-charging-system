package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import java.time.LocalTime;
import java.time.Instant;
import java.math.BigDecimal;

public record StationResponse(
        UUID id, UUID operatorId, UUID brandId, String name, String address, BigDecimal lat, BigDecimal lng,
        String status, @JsonProperty("is_24_7") Boolean is24_7, LocalTime openingTime, LocalTime closingTime, String accessType,
        String sourceUrl, Instant lastSyncedAt, Instant createdAt, Instant updatedAt
) {}
