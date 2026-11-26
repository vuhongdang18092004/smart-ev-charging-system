package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
public class Voucher extends BaseEntity {
    @Column(nullable = false, updatable = false)
    private UUID creatorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 30)
    private String codePrefix;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherDiscountType discountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    private int totalQuantity;
    private int claimedCount;
    private Instant validFrom;
    private Instant validTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private VoucherStatus status;

    @Column(columnDefinition = "text")
    private String rejectionReason;

    private UUID reviewedBy;
    private Instant reviewedAt;
}
