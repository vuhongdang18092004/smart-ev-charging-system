package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record BrandResponse(UUID id, String name, String type, String logoUrl, String website, UUID createdByUserId) {}
