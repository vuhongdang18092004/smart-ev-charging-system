package com.smart.evcharging.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record AvailableVoucherResponse(@JsonUnwrapped VoucherOfferResponse offer,
        @JsonProperty("is_claimed") boolean claimed) {}
