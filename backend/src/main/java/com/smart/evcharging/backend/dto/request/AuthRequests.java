package com.smart.evcharging.backend.dto.request;

import jakarta.validation.constraints.*;

public final class AuthRequests {
    private AuthRequests() {}

    public record Registration(@NotBlank @Size(max=100) String name, @NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email,
            @NotBlank @Size(min=8,max=72) String password) {}
    public record Email(@NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email) {}
    public record Verification(@NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email,
            @NotNull @Pattern(regexp="[0-9]{6}") String otp) {}
    public record Login(@NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email,
            @NotBlank @Size(max=72) String password, @NotNull @Pattern(regexp="web|mobile") String client) {}
    public record Refresh(@NotNull @Pattern(regexp="[A-Za-z0-9_-]{43}") String refreshToken,
            @NotNull @Pattern(regexp="web|mobile") String client) {}
    public record Reset(@NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email,
            @NotNull @Pattern(regexp="[0-9]{6}") String otp,
            @NotBlank @Size(min=8,max=72) String password) {}
    public record Invitation(@NotBlank @Size(max=100) String name,
            @NotBlank @jakarta.validation.constraints.Email @Size(max=255) String email) {}
}
