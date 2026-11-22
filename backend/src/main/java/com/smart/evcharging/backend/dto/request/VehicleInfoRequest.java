package com.smart.evcharging.backend.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record VehicleInfoRequest(
        @NotNull UUID brandId,
        @NotBlank @Size(max = 100) String model,
        @NotNull @Positive @Digits(integer = 6, fraction = 2) BigDecimal batteryKwh,
        @NotNull @PositiveOrZero Integer rangeNedcKm
) {}
