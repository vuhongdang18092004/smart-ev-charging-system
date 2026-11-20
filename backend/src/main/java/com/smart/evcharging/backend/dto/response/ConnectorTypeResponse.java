package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record ConnectorTypeResponse(UUID id, String code, String name, String currentType,
        @JsonProperty("is_active") Boolean active, Integer sortOrder) {}
