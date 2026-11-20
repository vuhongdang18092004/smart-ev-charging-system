package com.smart.evcharging.backend.dto.response;

import java.util.UUID;
import java.math.BigDecimal;

public record ConnectorResponse(UUID id, UUID stationId, UUID connectorTypeId, BigDecimal powerKw,
        BigDecimal pricePerKwh, String code, String status) {}
