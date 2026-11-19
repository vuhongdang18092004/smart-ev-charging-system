package com.smart.evcharging.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CreateStationRequest(
        @NotNull @Valid StationRequest station,
        List<@NotNull @Valid ConnectorRequest> connectors
) {}
