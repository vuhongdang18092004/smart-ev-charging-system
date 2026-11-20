package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTrackedEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "connectors")
public class Connector extends BaseTrackedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connector_type_id", nullable = false)
    private ConnectorType connectorType;

    @Column(name = "power_kw", precision = 6, scale = 2)
    private BigDecimal powerKw;

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "price_per_kwh", precision = 10, scale = 2)
    private BigDecimal pricePerKwh;
}
