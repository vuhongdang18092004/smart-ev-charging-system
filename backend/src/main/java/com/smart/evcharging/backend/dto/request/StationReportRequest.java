package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record StationReportRequest(
        @NotNull UUID driverId,
        UUID connectorTypeId,
        @NotNull @Pattern(regexp = DomainValues.REPORT_ISSUE_TYPES) String issueType,
        String note,
        List<@NotNull @Valid MediaRequest> media
) {}
