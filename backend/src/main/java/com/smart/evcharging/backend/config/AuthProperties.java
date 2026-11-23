package com.smart.evcharging.backend.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth")
public record AuthProperties(String issuer, String jwtKey, String otpKey, Duration accessTtl,
        Duration refreshTtl, Duration otpTtl, Duration resendDelay, int otpAttempts,
        int ipRequestsPerMinute, String adminEmail, String adminPassword, boolean legacyBasicEnabled) {}
