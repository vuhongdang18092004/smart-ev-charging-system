package com.smart.evcharging.backend.entity;

import com.smart.evcharging.backend.common.base.BaseTimestamps;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "operator_profiles")
public class OperatorProfile extends BaseTimestamps {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(name = "api_endpoint", length = 500)
    private String apiEndpoint;

    @Column(name = "api_key_hash", length = 255)
    private String apiKeyHash;

    @Column(name = "api_key_prefix", length = 16)
    private String apiKeyPrefix;

    @Column(name = "api_key_last_used_at")
    private Instant apiKeyLastUsedAt;

    @Column(name = "access_type", nullable = false, length = 20)
    private String accessType;
}
