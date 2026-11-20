package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record MediaResponse(UUID id, String mediaType, String url, String thumbnailUrl, int sortOrder) {}
