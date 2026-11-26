package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTrackedEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_vouchers")
@Getter
@Setter
public class UserVoucher extends BaseTrackedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voucher_id", updatable = false)
    private Voucher voucher;

    @Column(nullable = false, updatable = false)
    private UUID userId;

    @Column(nullable = false, unique = true, length = 50, updatable = false)
    private String redeemCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserVoucherStatus status;

    private Instant claimedAt;
    private Instant usedAt;

    @Column(columnDefinition = "text")
    private String qrText;
}
