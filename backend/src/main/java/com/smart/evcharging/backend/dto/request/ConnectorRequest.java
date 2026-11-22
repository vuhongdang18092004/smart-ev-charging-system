package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record ConnectorRequest(
        @NotNull UUID connectorTypeId,
        @Digits(integer = 4, fraction = 2) @PositiveOrZero BigDecimal powerKw,
        @Size(max = DomainValues.CONNECTOR_CODE_LENGTH) String code,
        @Pattern(regexp = DomainValues.CONNECTOR_STATUSES) String status
) {}
