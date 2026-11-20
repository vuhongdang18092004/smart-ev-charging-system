package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record CreateReviewRequest(
        @NotNull UUID driverId,
        @NotNull @Min(DomainValues.MIN_RATING) @Max(DomainValues.MAX_RATING) Short rating,
        String comment,
        List<@NotNull @Valid MediaRequest> media
) {}
