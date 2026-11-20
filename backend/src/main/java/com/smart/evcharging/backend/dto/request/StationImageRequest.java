package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.smart.evcharging.backend.common.validation.HttpMediaUrl;
import jakarta.validation.constraints.*;

public record StationImageRequest(
        @NotBlank @Size(max = 500) @HttpMediaUrl String url,
        @Size(max = 255) String caption,
        @JsonAlias("isPrimary") Boolean isPrimary,
        @JsonAlias("sortOrder") Integer sortOrder
) {}
