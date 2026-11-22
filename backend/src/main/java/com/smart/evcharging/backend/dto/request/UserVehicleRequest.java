package com.smart.evcharging.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UserVehicleRequest(@NotNull UUID vehicleInfoId) {}
