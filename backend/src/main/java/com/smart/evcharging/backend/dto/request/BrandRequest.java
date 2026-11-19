package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;

public record BrandRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String logoUrl,
        @Size(max = 500) String website,
        @Pattern(regexp = DomainValues.BRAND_TYPES) String type
) {}
