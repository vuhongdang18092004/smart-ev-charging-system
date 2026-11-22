package com.smart.evcharging.backend.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record VehicleInfoResponse(UUID id, UUID brandId, String model, BigDecimal batteryKwh, int rangeNedcKm, Instant createdAt, Instant updatedAt) {}
