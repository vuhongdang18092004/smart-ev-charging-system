package com.smart.evcharging.backend.dto.response;

import java.util.List;

public record StationDetailResponse(StationResponse station, List<ConnectorResponse> connectors) {}
