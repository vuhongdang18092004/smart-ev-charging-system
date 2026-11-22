package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vehicles_infor")
public class VehicleInfo extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "battery_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal batteryKwh;

    @Column(name = "range_nedc_km", nullable = false)
    private int rangeNedcKm;
}
