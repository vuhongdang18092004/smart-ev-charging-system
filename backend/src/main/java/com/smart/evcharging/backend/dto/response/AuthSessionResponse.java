package com.smart.evcharging.backend.dto.response;

public record AuthSessionResponse(String accessToken, String refreshToken, long expiresIn, AuthUserResponse user) {}
