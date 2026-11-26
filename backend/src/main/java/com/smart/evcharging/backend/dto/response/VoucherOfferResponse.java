package com.smart.evcharging.backend.dto.response;

import com.smart.evcharging.backend.entity.VoucherDiscountType;
import com.smart.evcharging.backend.entity.VoucherStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record VoucherOfferResponse(UUID id, String title, String description, String codePrefix,
        UUID stationId, String stationName, UUID brandId, String brandName, VoucherDiscountType discountType,
        BigDecimal discountValue, BigDecimal maxDiscountAmount, BigDecimal minOrderAmount,
        int totalQuantity, int claimedCount, Instant validFrom, Instant validTo, VoucherStatus status) {}
