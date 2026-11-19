package com.smart.evcharging.backend.common.base;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import lombok.Getter;

@Getter
@MappedSuperclass
public abstract class BaseEntity extends BaseTrackedEntity {
    @Column(name = "deleted_at")
    private Instant deletedAt;

    public void markDeleted(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }
}
