package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.smart.evcharging.backend.common.constants.DomainValues;
import com.smart.evcharging.backend.common.validation.HttpMediaUrl;
import jakarta.validation.constraints.*;

public record MediaRequest(
        @NotNull @Pattern(regexp = DomainValues.MEDIA_TYPES) @JsonAlias("mediaType") String mediaType,
        @NotBlank @Size(max = 500) @HttpMediaUrl String url,
        @Size(max = 500) @HttpMediaUrl @JsonAlias("thumbnailUrl") String thumbnailUrl,
        @JsonAlias("sortOrder") Integer sortOrder
) {}
