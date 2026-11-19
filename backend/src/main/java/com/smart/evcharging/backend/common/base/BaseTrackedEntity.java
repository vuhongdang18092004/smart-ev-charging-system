package com.smart.evcharging.backend.common.base;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.util.UUID;
import lombok.Getter;

@Getter
@MappedSuperclass
public abstract class BaseTrackedEntity extends BaseTimestamps {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
