package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record StationImageResponse(UUID id, String url, String caption, boolean isPrimary, int sortOrder) {}
