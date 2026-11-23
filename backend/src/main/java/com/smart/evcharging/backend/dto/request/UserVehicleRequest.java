package com.smart.evcharging.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UserVehicleRequest(@NotNull UUID vehicleInfoId, @Size(max = 100) String name) {}
