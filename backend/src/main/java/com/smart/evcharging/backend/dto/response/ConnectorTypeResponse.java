package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record ConnectorTypeResponse(UUID id, String code, String name, String currentType) {}
