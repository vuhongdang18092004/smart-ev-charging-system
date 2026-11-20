package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.validation.constraints.*;

public record OperatorRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = DomainValues.PASSWORD_MIN_LENGTH, max = DomainValues.BCRYPT_MAX_BYTES) String password,
        @Pattern(regexp = DomainValues.OPERATOR_ACCESS_TYPES) String accessType,
        @Size(max = 500) String apiEndpoint
) {}
