package com.smart.evcharging.backend.dto.response;

import java.time.Instant;
import java.util.UUID;

public record UserVehicleResponse(UUID id, UUID userId, UUID vehicleInfoId, Instant createdAt, Instant updatedAt, VehicleOptionResponse vehicleOption, String name) {}
