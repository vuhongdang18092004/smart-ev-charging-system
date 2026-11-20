package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.UUID;

public record OperatorResponse(UUID id, String name, String email, String accessType, String status,
        String apiEndpoint, @JsonProperty("allowedBrands") List<BrandSummaryResponse> allowedBrands) {}
