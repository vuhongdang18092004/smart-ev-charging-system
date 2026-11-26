package com.smart.evcharging.backend.dto.request;

import com.smart.evcharging.backend.entity.VoucherDiscountType;
import com.smart.evcharging.backend.entity.VoucherStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record VoucherRequest(
        UUID stationId, UUID brandId,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9-]{0,29}") String codePrefix,
        @NotBlank @Size(max = 200) String title, String description,
        @NotNull VoucherDiscountType discountType,
        @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal discountValue,
        @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal maxDiscountAmount,
        @PositiveOrZero @Digits(integer = 10, fraction = 2) BigDecimal minOrderAmount,
        @NotNull @Positive Integer totalQuantity,
        @NotNull Instant validFrom, @NotNull Instant validTo, VoucherStatus status
) {}
