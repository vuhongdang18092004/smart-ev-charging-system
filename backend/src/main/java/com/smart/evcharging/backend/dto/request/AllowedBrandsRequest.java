package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record AllowedBrandsRequest(
        @JsonProperty("brandIds") @JsonAlias("brand_ids") @NotNull List<@NotNull UUID> brandIds
) {}
