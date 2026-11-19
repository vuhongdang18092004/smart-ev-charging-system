package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record OperatorResponse(UUID id, String name, String email, String accessType) {}
