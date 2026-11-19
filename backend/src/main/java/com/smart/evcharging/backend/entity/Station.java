package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "stations")
public class Station extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operator_id", nullable = false)
    private UserAccount operator;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal lng;

    @Column(length = 20)
    private String status;

    @Column(name = "is_24_7")
    private Boolean is24_7;

    @JdbcTypeCode(SqlTypes.LOCAL_TIME)
    private LocalTime openingTime;

    @JdbcTypeCode(SqlTypes.LOCAL_TIME)
    private LocalTime closingTime;

    @Column(name = "access_type", nullable = false, length = 20)
    private String accessType;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    private Instant lastSyncedAt;
}
