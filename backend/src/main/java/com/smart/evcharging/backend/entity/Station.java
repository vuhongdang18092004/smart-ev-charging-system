package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseEntity;
import com.smart.evcharging.backend.common.constants.DomainValues;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.BatchSize;
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

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

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

    @Column(name = "price_per_kwh", precision = 10, scale = 2)
    private BigDecimal pricePerKwh;

    @Column(length = 20)
    private String phone;

    @Column(name = "location_type", nullable = false, length = 20)
    private String locationType = DomainValues.PUBLIC_LOCATION;

    @Column(name = "parking_fee_type", nullable = false, length = 20)
    private String parkingFeeType = DomainValues.UNKNOWN_PARKING_FEE;

    @Column(name = "avg_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal avgRating = BigDecimal.ZERO.setScale(2);

    @Column(name = "rating_count", nullable = false)
    private int ratingCount;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @BatchSize(size = 32)
    private List<StationImage> images = new ArrayList<>();

    public void addImage(StationImage image) {
        image.setStation(this);
        images.add(image);
    }
}
