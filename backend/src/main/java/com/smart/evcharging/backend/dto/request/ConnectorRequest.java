package com.smart.evcharging.backend.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record ConnectorRequest(
        @NotNull UUID connectorTypeId,
        @Digits(integer = 4, fraction = 2) @PositiveOrZero BigDecimal powerKw,
        @Positive Integer quantity,
        @Digits(integer = 8, fraction = 2) @PositiveOrZero BigDecimal pricePerKwh
) {}
