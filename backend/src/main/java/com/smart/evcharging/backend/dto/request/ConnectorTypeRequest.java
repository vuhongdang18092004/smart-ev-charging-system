package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;

public record ConnectorTypeRequest(
        @NotBlank @Size(max = 20) String code,
        @NotBlank @Size(max = 100) String name,
        @NotNull @Pattern(regexp = DomainValues.CURRENT_TYPES) String currentType,
        @JsonAlias("is_active") Boolean active,
        Integer sortOrder
) {}
