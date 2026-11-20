package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record AllowedBrandResponse(UUID id, String name, String type, @JsonProperty("logoUrl") String logoUrl) {}
