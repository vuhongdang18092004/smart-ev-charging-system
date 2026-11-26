package com.smart.evcharging.backend.dto.response;

import com.smart.evcharging.backend.entity.UserVoucherStatus;
import java.time.Instant;
import java.util.UUID;

public record UserVoucherResponse(UUID id, VoucherOfferResponse voucher, String redeemCode,
        UserVoucherStatus status, Instant claimedAt, Instant usedAt, String qrText) {}
