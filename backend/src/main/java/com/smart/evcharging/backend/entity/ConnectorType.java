package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTrackedEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "connector_types")
public class ConnectorType extends BaseTrackedEntity {
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "current_type", nullable = false, length = 5)
    private String currentType;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
