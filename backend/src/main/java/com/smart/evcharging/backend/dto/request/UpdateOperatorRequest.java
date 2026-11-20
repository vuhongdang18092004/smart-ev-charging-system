package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateOperatorRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Pattern(regexp = DomainValues.USER_STATUSES) String status,
        @Pattern(regexp = DomainValues.OPERATOR_ACCESS_TYPES) String accessType,
        @Size(max = 500) String apiEndpoint,
        @Size(min = DomainValues.PASSWORD_MIN_LENGTH, max = DomainValues.BCRYPT_MAX_BYTES) String password
) {
    public UpdateOperatorRequest {
        if (password != null && password.isBlank()) {
            password = null;
        }
    }
}
