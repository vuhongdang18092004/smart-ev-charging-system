package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import java.time.Instant;
import java.util.UUID;

public record VoucherResponse(@JsonUnwrapped VoucherOfferResponse offer, UUID creatorId,
        String rejectionReason, UUID reviewedBy, Instant reviewedAt) {}
