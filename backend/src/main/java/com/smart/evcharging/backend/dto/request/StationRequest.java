package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record StationRequest(
        @NotNull UUID operatorId,
        @NotNull UUID brandId,
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 500) String address,
        @NotNull @DecimalMin("-90") @DecimalMax("90") Double lat,
        @NotNull @DecimalMin("-180") @DecimalMax("180") Double lng,
        @Pattern(regexp = DomainValues.STATION_STATUSES) String status,
        @JsonProperty("is_24_7") Boolean is24_7,
        LocalTime openingTime,
        LocalTime closingTime,
        @Pattern(regexp = DomainValues.STATION_ACCESS_TYPES) String accessType,
        @Size(max = 500) String sourceUrl,
        @JsonAlias("locationType") @Pattern(regexp = DomainValues.LOCATION_TYPES) String locationType,
        @JsonAlias("parkingFeeType") @Pattern(regexp = DomainValues.PARKING_FEE_TYPES) String parkingFeeType,
        List<@NotNull @Valid StationImageRequest> images
) {}
