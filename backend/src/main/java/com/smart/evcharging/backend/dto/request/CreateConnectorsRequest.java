package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateConnectorsRequest(
        @NotNull UUID connectorTypeId,
        @Digits(integer = 4, fraction = 2) @PositiveOrZero BigDecimal powerKw,
        @Digits(integer = 8, fraction = 2) @PositiveOrZero BigDecimal pricePerKwh,
        @JsonAlias("count") @Min(1) @Max(DomainValues.MAX_CONNECTOR_QUANTITY) Integer quantity,
        @Size(max = DomainValues.CONNECTOR_CODE_LENGTH) String code,
        @Size(max = DomainValues.CONNECTOR_PREFIX_LENGTH) String codePrefix,
        @Pattern(regexp = DomainValues.CONNECTOR_STATUSES) String status
) {}
