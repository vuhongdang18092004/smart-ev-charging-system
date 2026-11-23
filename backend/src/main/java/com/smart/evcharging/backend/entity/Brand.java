package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTrackedEntity;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "brands")
public class Brand extends BaseTrackedEntity {
    @Column(name = "created_by_user_id")
    private UUID createdByUserId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String website;

    @Column(length = 20)
    private String type;
}
