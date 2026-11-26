package com.smart.evcharging.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record VoucherRejectRequest(@NotBlank @JsonAlias("rejectionReason") String rejectionReason) {}
