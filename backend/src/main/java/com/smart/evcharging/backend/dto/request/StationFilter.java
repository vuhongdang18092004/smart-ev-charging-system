package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record StationFilter(
        @Size(max = 200) String keyword,
        UUID brandId,
        UUID operatorId,
        @Pattern(regexp = DomainValues.STATION_STATUSES) String status,
        @Pattern(regexp = DomainValues.LOCATION_TYPES) String locationType,
        @Pattern(regexp = DomainValues.PARKING_FEE_TYPES) String parkingFeeType
) {}
