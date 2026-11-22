package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record VehicleOptionResponse(UUID id, UUID brandId, String model) {}
