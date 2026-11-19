package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record StationFilter(
        @Size(max = 200) String keyword,
        UUID brandId,
        UUID operatorId,
        @Pattern(regexp = DomainValues.STATION_STATUSES) String status
) {}
