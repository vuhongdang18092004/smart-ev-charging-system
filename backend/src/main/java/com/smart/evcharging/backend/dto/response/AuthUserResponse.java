package com.smart.evcharging.backend.dto.response;

import java.util.UUID;

public record AuthUserResponse(UUID id, String name, String email, String role, boolean emailVerified) {}
